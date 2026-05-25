export const ADMIN_PHONES = ['9360113501'] as const

export function isAdminPhone(phone: string): boolean {
  return (ADMIN_PHONES as readonly string[]).includes(phone)
}
