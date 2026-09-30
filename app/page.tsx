"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { homeFor, useAuth } from "@/lib/auth"

/** Корень сайта: отправляем на кабинет по роли или на вход. */
export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (loading) return
    router.replace(user ? homeFor(user.role) : "/login")
  }, [loading, user, router])
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Загрузка">
      <Spinner className="text-brand size-7" />
    </div>
  )
}
