"use client"

import Link from "next/link"
import { useState } from "react"
import { IconAlertCircle, IconMailCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { errorText } from "@/lib/api"
import { authApi } from "@/lib/services"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(errorText(err))
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <IconMailCheck className="text-primary size-10" aria-hidden />
        <h1 className="text-3xl font-semibold tracking-tight">Проверьте почту</h1>
        <p className="text-muted-foreground text-sm">
          Если адрес {email} зарегистрирован, мы отправили на него ссылку для смены пароля. Она действует один час.
        </p>
        <Link href="/login" className="text-foreground text-sm font-medium underline underline-offset-4">
          Вернуться ко входу
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Восстановление пароля</h1>
          <p className="text-muted-foreground text-sm">Укажите email, и мы пришлём ссылку для смены пароля.</p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" required />
        </Field>
        {error && (
          <p role="alert" className="bg-danger-soft text-destructive flex items-start gap-2 rounded-lg px-3 py-2 text-sm">
            <IconAlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{error}</span>
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
          {loading ? <Spinner className="size-5" /> : null}
          Отправить ссылку
        </Button>
        <Link href="/login" className="text-muted-foreground hover:text-foreground text-center text-sm underline-offset-4 hover:underline">
          Вернуться ко входу
        </Link>
      </FieldGroup>
    </form>
  )
}
