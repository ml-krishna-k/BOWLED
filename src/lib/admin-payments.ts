/**
 * Admin payment-queue API client. Used by /admin/payments.
 *
 * Server-side enforces requireAdmin on every route.
 */
import { api } from '@/lib/api'
import type { PaymentStatus } from '@/types'

export interface AdminPaymentRow {
  id: string
  orderRef: string
  amount: number
  utr: string
  screenshotUrl: string
  status: PaymentStatus
  submittedAt: number
  reviewedAt: number | null
  rejectionReason: string | null
  planId: 'solo' | 'squad' | 'floor'
  billingCycleId: 'weekly' | 'weekly-no-sun' | 'monthly-no-sun' | 'monthly-no-weekend'
  expiresAt: number
  user: {
    id: string
    name: string
    phone: string
    area: string
    pgName: string
  } | null
}

export interface AdminAuditEntry {
  id: string
  action: 'approved' | 'rejected'
  reason: string | null
  adminName: string
  at: number
}

export async function listAdminPayments(
  status: PaymentStatus | 'all' = 'pending_verification',
): Promise<AdminPaymentRow[]> {
  const { payments } = await api<{ payments: AdminPaymentRow[] }>(
    `/api/admin/payments?status=${encodeURIComponent(status)}`,
  )
  return payments
}

export async function approvePayment(id: string): Promise<AdminPaymentRow> {
  const { payment } = await api<{ payment: AdminPaymentRow }>(
    `/api/admin/payments/${id}/approve`,
    { method: 'POST' },
  )
  return payment
}

export async function rejectPayment(id: string, reason?: string): Promise<AdminPaymentRow> {
  const { payment } = await api<{ payment: AdminPaymentRow }>(
    `/api/admin/payments/${id}/reject`,
    { body: { reason: reason ?? undefined } },
  )
  return payment
}

export async function fetchPaymentAudit(id: string): Promise<AdminAuditEntry[]> {
  const { audit } = await api<{ audit: AdminAuditEntry[] }>(
    `/api/admin/payments/${id}/audit`,
  )
  return audit
}
