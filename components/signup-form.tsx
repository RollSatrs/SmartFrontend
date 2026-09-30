"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { IconAlertCircle } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { errorText } from "@/lib/api"
import { homeFor, useAuth } from "@/lib/auth"
import { authApi } from "@/lib/services"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"

const ROLES: { value: Extract<Role, "resident" | "gov_official">; label: string }[] = [
  { value: "resident", label: "Житель" },
  { value: "gov_official", label: "Госорган" },
]

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const [role, setRole] = useState<"resident" | "gov_official">("resident")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { setUser } = useAuth()

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) return setError("Пароль должен содержать не менее 8 символов.")
    if (role === "gov_official" && inviteCode.trim().length < 12)
      return setError("Введите код приглашения: он выдаётся администратором.")
    setLoading(true)
    try {
      const user = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        inviteCode: role === "gov_official" ? inviteCode.trim() : undefined,
      })
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
          <h1 className="text-3xl font-semibold tracking-tight">Регистрация</h1>
          <p className="text-muted-foreground text-sm">Один профиль, чтобы отправлять идеи и получать ответы.</p>
        </div>

        <div role="radiogroup" aria-label="Роль" className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1">
          {ROLES.map((item) => (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={role === item.value}
              onClick={() => setRole(item.value)}
              className={cn(
                "h-9 rounded-lg text-sm font-medium transition-colors",
                role === item.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <Field>
          <FieldLabel htmlFor="name">Имя и фамилия</FieldLabel>
          <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
          <FieldDescription>Минимум 8 символов.</FieldDescription>
        </Field>
        {role === "gov_official" && (
          <Field>
            <FieldLabel htmlFor="invite">Код приглашения</FieldLabel>
            <Input
              id="invite"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="h-11"
            />
            <FieldDescription>Код выдаёт администратор. Без него регистрация сотрудника недоступна.</FieldDescription>
          </Field>
        )}

        {error && (
          <p role="alert" className="bg-danger-soft text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}

        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="size-5" /> : null}
          {loading ? "Создаём аккаунт" : "Создать аккаунт"}
        </Button>

        <p className="text-muted-foreground text-center text-sm">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-foreground font-medium underline underline-offset-4">
            Войти
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}
