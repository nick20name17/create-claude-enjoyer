import * as z from 'zod/mini'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.string()
})
export type User = z.infer<typeof UserSchema>
