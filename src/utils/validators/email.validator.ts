import { REGEX } from '@/constants/regex.constants'

export function isValidEmail(email: string): boolean {
  return REGEX.EMAIL.test(email.trim())
}
