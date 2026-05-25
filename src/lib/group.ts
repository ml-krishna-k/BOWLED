import { api } from './api'

export interface GroupPreview {
  groupCode: string
  planId: 'solo' | 'squad' | 'floor'
  billingCycleId: 'weekly' | 'weekly-no-sun' | 'monthly-no-sun' | 'monthly-no-weekend'
  groupSize: number
  area: string
  members: Array<{ firstName: string; joinedAt: number }>
}

export async function lookupGroup(code: string): Promise<GroupPreview> {
  const data = await api<{ group: GroupPreview }>(`/api/group/${encodeURIComponent(code)}`)
  return data.group
}
