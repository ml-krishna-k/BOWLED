/**
 * Outbound notifications (currently SMS via MSG91 Flow).
 *
 * Every function here is "fire and forget" — they never throw. Notification
 * failures must NOT take down the business action that triggered them
 * (admin approving a payment, cron firing a reminder, etc).
 *
 * To register templates in MSG91 → Flow:
 *   1. Get the template DLT-approved with your operator.
 *   2. Create a Flow in MSG91 pointing at that template.
 *   3. Set the matching MSG91_*_TEMPLATE_ID env var to the Flow's template id.
 *
 * Suggested template bodies (variables in {{ }}):
 *
 *   APPROVED:
 *     "Hi {{name}}, your Bowled subscription is now active for 30 days! 🎉
 *      Open the app to see today's meals. — Bowled"
 *
 *   REJECTED:
 *     "Hi {{name}}, your last Bowled payment couldn't be verified.
 *      Reason: {{reason}}. Please submit a fresh payment in the app. — Bowled"
 *
 *   RENEWAL:
 *     "Hi {{name}}, your Bowled plan expires in {{days}} days.
 *      Renew in the app to keep your meals going. — Bowled"
 */
import { config } from '../config.js'
import { sendFlow } from './msg91.js'

interface ApprovalArgs {
  phone: string
  name: string
}

interface RejectionArgs {
  phone: string
  name: string
  reason: string
}

interface RenewalArgs {
  phone: string
  name: string
  daysLeft: number
}

/**
 * Internal helper — sends, swallows errors, logs in dev. If the matching
 * template id isn't set, skips entirely (no SMS goes out).
 */
async function safeSend(
  templateId: string,
  phone: string,
  vars: Record<string, string>,
  label: string,
): Promise<void> {
  if (!templateId) {
    if (config.nodeEnv !== 'production') {
      console.log(`[notify:${label}] skipped — no template id set. Would send to ${phone} with:`, vars)
    }
    return
  }
  if (!config.msg91.apiKey) {
    if (config.nodeEnv !== 'production') {
      console.log(`[notify:${label}] skipped — no MSG91_API_KEY. Would send to ${phone}.`)
    }
    return
  }
  try {
    await sendFlow(phone, templateId, vars)
    if (config.nodeEnv !== 'production') {
      console.log(`[notify:${label}] ✓ sent to ${phone}`)
    }
  } catch (err) {
    // Log but never throw — SMS failure must not cascade into the caller.
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[notify:${label}] ✗ failed for ${phone}: ${msg}`)
  }
}

export function notifyPaymentApproved(args: ApprovalArgs): Promise<void> {
  return safeSend(
    config.msg91.approvedTemplateId,
    args.phone,
    {
      name: firstName(args.name),
    },
    'approved',
  )
}

export function notifyPaymentRejected(args: RejectionArgs): Promise<void> {
  return safeSend(
    config.msg91.rejectedTemplateId,
    args.phone,
    {
      name: firstName(args.name),
      reason: clipReason(args.reason),
    },
    'rejected',
  )
}

export function notifyRenewalDue(args: RenewalArgs): Promise<void> {
  return safeSend(
    config.msg91.renewalTemplateId,
    args.phone,
    {
      name: firstName(args.name),
      days: String(Math.max(0, args.daysLeft)),
    },
    'renewal',
  )
}

/* ---------- Helpers ------------------------------------------------------- */

function firstName(full: string): string {
  const trimmed = (full ?? '').trim()
  if (!trimmed) return 'there'
  return trimmed.split(/\s+/)[0]
}

/** DLT templates have a character cap on each variable — keep reasons short. */
function clipReason(s: string): string {
  const trimmed = (s ?? '').trim()
  if (!trimmed) return 'verification failed'
  return trimmed.length > 80 ? trimmed.slice(0, 77) + '…' : trimmed
}
