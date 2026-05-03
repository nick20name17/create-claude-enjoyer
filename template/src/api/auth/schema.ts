import * as z from 'zod/mini'

import { EmailSchema, PasswordSchema, RequiredStringSchema } from '@/api/schema'

import type { User } from '../user/schema'

export interface Tokens {
  access: string
  refresh: string
}

export const SignInSchema = z.object({ email: EmailSchema, password: PasswordSchema })
export type SignInPayload = z.infer<typeof SignInSchema>

export const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: RequiredStringSchema
})
export type SignUpPayload = z.infer<typeof SignUpSchema>

export interface RefreshPayload {
  refresh: string
}

export interface SignInResponse extends Tokens {
  user: User
}

export type Session = SignInResponse
