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
import { authApi } from "@/lib/services"

export function ResetPasswordForm() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const token = useSearchParams().get("token")

  if (!token) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Ссылка недействительна</h1>
        <p className="text-muted-foreground text-sm">Запросите новую ссылку для смены пароля.</p>
        <Link href="/forgot-password" className="text-foreground text-sm font-medium underline underline-offset-4">
          Запросить ссылку
        </Link>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) return setError("Пароль должен содержать не менее 8 символов.")
    if (password !== confirm) return setError("Пароли не совпадают.")
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      router.replace("/login")
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Новый пароль</h1>
          <p className="text-muted-foreground text-sm">Придумайте пароль не короче 8 символов.</p>
        </div>
        <Field>
          <FieldLabel htmlFor="password">Новый пароль</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm">Повторите пароль</FieldLabel>
          <Input id="confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" required />
        </Field>
        {error && (
          <p role="alert" className="bg-danger-soft text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="size-5" /> : null}
          Сменить пароль
        </Button>
      </FieldGroup>
    </form>
  )
}
