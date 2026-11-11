import { z } from 'zod'

const email = z.string().trim().toLowerCase().email('Enter a valid email')

/** Mirrors the API password policy (class-validator IsStrongPassword + 64 max). */
export const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .max(64, 'At most 64 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/\d/, 'Include a number')
  .regex(/[^A-Za-z0-9]/, 'Include a symbol')

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(120),
    email,
    workspaceName: z.string().trim().min(2, 'Workspace name is required').max(120),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({ password: passwordRule, confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const profileSchema = z.object({ name: z.string().trim().min(2, 'Name is required').max(120) })

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name is required').max(120),
})

export const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name is required').max(120),
  timezone: z.string().min(1, 'Choose a time zone'),
  locale: z.string().regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Use a locale like "en" or "en-US"'),
})

export const inviteSchema = z.object({
  email,
  roleId: z.string().uuid('Choose a role'),
})

export const roleSchema = z.object({
  name: z.string().trim().min(2, 'Role name is required').max(80),
  description: z.string().trim().max(255).optional(),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

export const apiKeySchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  scopes: z.array(z.string()).min(1, 'Select at least one scope'),
  expiresAt: z
    .string()
    .optional()
    .refine((v) => !v || new Date(v) > new Date(), 'Expiry must be in the future'),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
export type ProfileSchema = z.infer<typeof profileSchema>
export type WorkspaceSchema = z.infer<typeof workspaceSchema>
export type WorkspaceSettingsSchema = z.infer<typeof workspaceSettingsSchema>
export type InviteSchema = z.infer<typeof inviteSchema>
export type RoleSchema = z.infer<typeof roleSchema>
export type ApiKeySchema = z.infer<typeof apiKeySchema>
