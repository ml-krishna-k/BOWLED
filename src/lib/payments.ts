/**
 * Manual UPI payment flow.
 *
 *   1. /api/subscription POST returns { subscription, paymentInstructions }
 *      when the user has no existing sub. Subscription status is
 *      `pending_payment`, instructions carry UPI ID + amount + orderRef.
 *
 *   2. User pays in their UPI app (Google Pay, PhonePe, Paytm, etc).
 *
 *   3. submitPayment({ utr, screenshotUrl }) — uploads UTR + Cloudinary URL.
 *      Server creates a Payment in `pending_verification`.
 *
 *   4. listMyPayments() — used by the "verification in progress" UI to
 *      surface status (pending / approved / rejected).
 *
 *   5. uploadPaymentScreenshot(file) — Cloudinary upload via the dedicated
 *      authenticated endpoint that scopes images to `payments/<uid>`.
 */
import { api } from './api'
import { fileToDataUri, type UploadedImage } from './upload'
import type { PaymentRecord } from '@/types'

export interface SubmitPaymentInput {
  utr: string
  screenshotUrl: string
}

export async function submitPayment(input: SubmitPaymentInput): Promise<PaymentRecord> {
  const { payment } = await api<{ payment: PaymentRecord }>('/api/payments', {
    body: input,
  })
  return payment
}

export async function listMyPayments(): Promise<PaymentRecord[]> {
  const { payments } = await api<{ payments: PaymentRecord[] }>('/api/payments/mine')
  return payments
}

/**
 * Upload a screenshot file via the per-user `payments/<uid>` Cloudinary
 * endpoint. Validates type + size client-side before the round trip.
 */
export async function uploadPaymentScreenshot(file: File): Promise<UploadedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are supported')
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Screenshot is too large — keep it under 6 MB')
  }
  const dataUri = await fileToDataUri(file)
  return api<UploadedImage>('/api/upload/payment-screenshot', {
    body: { data: dataUri },
  })
}
