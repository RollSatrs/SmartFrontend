import type { Idea } from "@/lib/types"

const ruDate = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("ru-RU", options)

const shortFmt = ruDate({ day: "numeric", month: "short" })
const longFmt = ruDate({ day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })

export const formatShort = (iso: string) => shortFmt.format(new Date(iso)).replace(".", "")
export const formatLong = (iso: string) => longFmt.format(new Date(iso)).replace(" г.,", ",")

/** «1 обращение», «2 обращения», «5 обращений». */
export function appeals(n: number) {
  const mod100 = n % 100
  const mod10 = n % 10
  let word = "обращений"
  if (mod100 < 11 || mod100 > 14) {
    if (mod10 === 1) word = "обращение"
    else if (mod10 >= 2 && mod10 <= 4) word = "обращения"
  }
  return `${n} ${word}`
}

/** Срок рассмотрения обращения по закону об обращениях граждан: 15 календарных дней (уточнить у юристов). */
export const RESPONSE_DEADLINE_DAYS = 15

export const isOpen = (idea: Pick<Idea, "status">) => idea.status !== "done" && idea.status !== "rejected"

/** Сколько полных суток осталось до срока. Отрицательное число: срок прошёл. `null` у закрытых идей. */
export function daysLeft(idea: Pick<Idea, "status" | "createdAt">): number | null {
  if (!isOpen(idea)) return null
  const deadline = new Date(idea.createdAt).getTime() + RESPONSE_DEADLINE_DAYS * 86_400_000
  return Math.floor((deadline - Date.now()) / 86_400_000)
}

export const isUrgent = (idea: Pick<Idea, "status" | "createdAt">) => (daysLeft(idea) ?? Infinity) <= 3
export const isOverdue = (idea: Pick<Idea, "status" | "createdAt">) => (daysLeft(idea) ?? 0) < 0

export function deadlineText(idea: Pick<Idea, "status" | "createdAt">): string | null {
  const left = daysLeft(idea)
  if (left === null) return null
  if (left < 0) return `Просрочено на ${-left} дн.`
  if (left === 0) return "Последний день"
  return `Осталось ${left} дн.`
}

export const signed = (value: number) => (value > 0 ? `+${value}%` : `${value}%`)

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?"
