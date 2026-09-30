"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { IconAlertCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { errorText } from "@/lib/api"
import { homeFor, useAuth } from "@/lib/auth"
import { authApi } from "@/lib/services"
import { cn } from "@/lib/utils"

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useSearchParams()
  const { setUser } = useAuth()
  const expired = params.get("expired") === "1"

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Пароль должен содержать не менее 8 символов.")
      return
    }
    setLoading(true)
    try {
      const user = await authApi.login(email.trim(), password)
      setUser(user)
      router.replace(homeFor(user.role))
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Вход</h1>
          <p className="text-muted-foreground text-sm">Войдите, чтобы подать идею или вести обращения.</p>
        </div>

        {expired && !error && (
          <p role="status" className="bg-gold-soft text-gold-ink rounded-lg px-3 py-2 text-sm">
            Сессия истекла. Войдите снова.
          </p>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground ml-auto text-sm underline-offset-4 hover:underline">
              Забыли пароль?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11"
            required
          />
        </Field>

        {error && (
          <p role="alert" className="bg-danger-soft text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}

        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="size-5" /> : null}
          {loading ? "Входим" : "Войти"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Нет аккаунта?{" "}
          <Link href="/signup" className="text-foreground font-medium underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}
