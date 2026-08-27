import { shouldMockModule } from '@/config/env.config'
import { teamApi } from '@/api/endpoints/team.api'
import type { ApiResponse } from '@/types/api.types'
import type {
  TeamMember,
  TeamInvitation,
  TeamActivityLog,
  RoleDefinition,
} from '@/types/team.types'
import type { Role } from '@/config/permissions'
import { delay, ok } from '@/lib/mock'
import {
  mockTeamMembers,
  mockTeamInvitations,
  mockTeamActivity,
  mockRoleDefinitions,
} from '@/services/mock/mock-data'

let members = [...mockTeamMembers]
let invitations = [...mockTeamInvitations]

export const teamService = {
  async members(): Promise<ApiResponse<TeamMember[]>> {
    if (shouldMockModule('team')) {
      await delay()
      return ok(members)
    }
    const res = await teamApi.members()
    return res.data
  },

  async roles(): Promise<ApiResponse<RoleDefinition[]>> {
    if (shouldMockModule('team')) {
      await delay()
      return ok(mockRoleDefinitions)
    }
    const res = await teamApi.roles()
    return res.data
  },

  async invitations(): Promise<ApiResponse<TeamInvitation[]>> {
    if (shouldMockModule('team')) {
      await delay()
      return ok(invitations)
    }
    const res = await teamApi.invitations()
    return res.data
  },

  async activity(): Promise<ApiResponse<TeamActivityLog[]>> {
    if (shouldMockModule('team')) {
      await delay()
      return ok(mockTeamActivity)
    }
    const res = await teamApi.activity()
    return res.data
  },

  async invite(email: string, role: Role): Promise<ApiResponse<TeamInvitation>> {
    if (shouldMockModule('team')) {
      await delay()
      const inv: TeamInvitation = {
        id: `inv_${Date.now()}`,
        email,
        role,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      }
      invitations = [inv, ...invitations]
      return ok(inv, 'Invitation sent')
    }
    const res = await teamApi.invite(email, role)
    return res.data
  },
}
