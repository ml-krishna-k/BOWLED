export function inr(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN')
}

export function timeFromNow(targetIso: string): string {
  return targetIso
}

export function greeting(now = new Date()): string {
  const h = now.getHours()
  if (h < 5) return 'Up late'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

export function maskPhone(phone: string): string {
  if (phone.length < 10) return phone
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`
}

export function shortPhone(phone: string): string {
  if (phone.length < 10) return phone
  return `xxxxx ${phone.slice(5)}`
}

export function generateGroupCode(): string {
  const part = () => Math.random().toString(36).slice(2, 5).toUpperCase()
  return `KF-${part()}-${part()}`
}
