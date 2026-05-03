import { z } from 'zod'

const envSchema = z.object({ VITE_API_URL: z.string().min(1) })

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(z.treeifyError(parsed.error), null, 2)}`
  )
}

export const env = parsed.data
