import * as z from 'zod/mini'

import { EmailSchema, PasswordSchema, RequiredStringSchema } from '@/api/schema'
import { UserSchema } from '@/api/user/schema'

export const TokensSchema = z.object({
  access: z.string(),
  refresh: z.string()
})
export type Tokens = z.infer<typeof TokensSchema>

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

export const SessionSchema = z.object({
  access: z.string(),
  refresh: z.string(),
  user: UserSchema
})

export type Session = z.infer<typeof SessionSchema>
export type SignInResponse = Session
