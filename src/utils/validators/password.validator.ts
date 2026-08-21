import { REGEX } from '@/constants/regex.constants'

export function isValidPassword(password: string): boolean {
  return REGEX.PASSWORD.test(password)
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak'
  if (REGEX.PASSWORD.test(password)) return 'strong'
  return 'medium'
}
