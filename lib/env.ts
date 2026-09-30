import { z } from "zod"

const envSchema = z.object({
  // По умолчанию запросы идут на тот же адрес сайта (`/api`), а Next.js проксирует их на backend.
  // Так страница по HTTPS может работать с backend по HTTP, и куки входа остаются на одном домене.
  NEXT_PUBLIC_API_URL: z.string().min(1).default("/api"),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n")
  throw new Error(`Некорректные переменные окружения:\n${issues}`)
}

export const env = parsed.data
