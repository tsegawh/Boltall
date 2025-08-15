import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  TRACCAR_API_URL: z.string().url(),
  TRACCAR_USERNAME: z.string(),
  TRACCAR_PASSWORD: z.string(),
  TRACCAR_WEBSOCKET_URL: z.string().url(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.format())
  process.exit(1)
}

export const env = parsed.data