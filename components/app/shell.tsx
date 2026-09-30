"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  IconChartPie,
  IconHome,
  IconInbox,
  IconLogout,
  IconMap2,
  IconTrophy,
  IconBulb,
  type Icon,
} from "@tabler/icons-react"
import { BrandName } from "@/components/app/brand"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { homeFor, useAuth } from "@/lib/auth"
import { initials } from "@/lib/format"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: Icon; match?: (path: string) => boolean }

const RESIDENT_NAV: NavItem[] = [
  { href: "/resident", label: "Главная", icon: IconHome, match: (p) => p === "/resident" },
  { href: "/resident/ideas", label: "Мои идеи", icon: IconBulb, match: (p) => p.startsWith("/resident/ideas") || p.startsWith("/ideas") },
  { href: "/districts", label: "Районы", icon: IconTrophy, match: (p) => p.startsWith("/districts") },
]

const GOV_NAV: NavItem[] = [
  { href: "/gov", label: "Обращения", icon: IconInbox, match: (p) => p === "/gov" || p.startsWith("/gov/ideas") },
  { href: "/gov/map", label: "Карта", icon: IconMap2, match: (p) => p.startsWith("/gov/map") },
  { href: "/gov/analytics", label: "Аналитика", icon: IconChartPie, match: (p) => p.startsWith("/gov/analytics") || p.startsWith("/districts") },
]

export function Shell({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace("/login")
    else if (!allow.includes(user.role)) router.replace(homeFor(user.role))
  }, [loading, user, allow, router])

  if (loading || !user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Загрузка">
        <Spinner className="text-brand size-7" />
      </div>
    )
  }

  const nav = user.role === "resident" ? RESIDENT_NAV : GOV_NAV

  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="bg-background/85 sticky top-0 z-40 border-b backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href={homeFor(user.role)} aria-label="На главную">
            <BrandName />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Основная навигация">
            {nav.map((item) => {
              const active = item.match ? item.match(pathname) : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
                    active ? "bg-sage-soft text-sage-ink" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-[18px]" aria-hidden />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden items-center gap-2.5 pl-2 sm:flex">
              <span className="bg-sage-soft text-sage-ink flex size-9 items-center justify-center rounded-full text-xs font-semibold" aria-hidden>
                {initials(user.name)}
              </span>
              <span className="flex max-w-40 flex-col leading-tight">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">{user.role === "resident" ? "Житель" : "Сотрудник госоргана"}</span>
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => void logout()} aria-label="Выйти из аккаунта">
              <IconLogout className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>

      <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-md md:hidden" aria-label="Основная навигация">
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {nav.map((item) => {
            const active = item.match ? item.match(pathname) : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-6" aria-hidden />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground text-sm text-pretty">{description}</p>}
      </div>
      {action}
    </div>
  )
}
