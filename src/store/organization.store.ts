import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'professional' | 'business' | 'enterprise'
}

interface OrganizationState {
  organizations: Organization[]
  currentOrganizationId: string | null
  setOrganizations: (orgs: Organization[]) => void
  setCurrentOrganization: (id: string) => void
  currentOrganization: () => Organization | null
}

const DEMO_ORGS: Organization[] = [
  {
    id: 'org_1',
    name: 'Acme Voice',
    slug: 'acme-voice',
    plan: 'professional',
  },
  {
    id: 'org_2',
    name: 'Harbor Labs',
    slug: 'harbor-labs',
    plan: 'starter',
  },
]

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: DEMO_ORGS,
      currentOrganizationId: DEMO_ORGS[0].id,
      setOrganizations: (orgs) => set({ organizations: orgs }),
      setCurrentOrganization: (id) => set({ currentOrganizationId: id }),
      currentOrganization: () => {
        const { organizations, currentOrganizationId } = get()
        return organizations.find((o) => o.id === currentOrganizationId) ?? null
      },
    }),
    { name: 'ai-voice-organization' },
  ),
)
