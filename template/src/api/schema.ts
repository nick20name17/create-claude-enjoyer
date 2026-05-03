import * as z from 'zod/mini'

export const RequiredStringSchema = z
  .string({ error: 'Required' })
  .check(z.minLength(1, { error: 'Required' }), z.trim())

export const EmailSchema = z
  .email({ error: 'Invalid email' })
  .check(z.minLength(1, { error: 'Required' }), z.trim())

export const PasswordSchema = RequiredStringSchema.check(
  z.minLength(8, { error: 'Min 8 characters' }),
  z.maxLength(64, { error: 'Max 64 characters' })
)
