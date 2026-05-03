import * as z from 'zod/mini'

import { EmailSchema, PasswordSchema } from '@/api/schema'

export const SignInSchema = z.object({ email: EmailSchema, password: PasswordSchema })

export type SignInPayload = z.infer<typeof SignInSchema>

export interface User {
  id: string
  email: string
  name: string
}

export interface Session {
  user: User
}
