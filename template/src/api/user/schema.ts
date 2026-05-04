import * as z from 'zod/mini'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string()
})
export type User = z.infer<typeof UserSchema>
