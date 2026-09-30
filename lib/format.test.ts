import { describe, expect, it } from "vitest"
import { appeals, daysLeft, deadlineText, isOverdue, isUrgent, signed } from "./format"

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString()

describe("appeals", () => {
  it("склоняет слово «обращение»", () => {
    expect(appeals(1)).toBe("1 обращение")
    expect(appeals(2)).toBe("2 обращения")
    expect(appeals(5)).toBe("5 обращений")
    expect(appeals(11)).toBe("11 обращений")
    expect(appeals(21)).toBe("21 обращение")
  })
})

describe("сроки рассмотрения", () => {
  it("считает остаток от 15 дней", () => {
    expect(daysLeft({ status: "received", createdAt: daysAgo(1.5) })).toBe(13)
  })

  it("не считает срок у закрытых обращений", () => {
    expect(daysLeft({ status: "done", createdAt: daysAgo(40) })).toBeNull()
    expect(isOverdue({ status: "rejected", createdAt: daysAgo(40) })).toBe(false)
  })

  it("отмечает просрочку и горящие сроки", () => {
    const late = { status: "in_progress" as const, createdAt: daysAgo(19.5) }
    expect(isOverdue(late)).toBe(true)
    expect(deadlineText(late)).toBe("Просрочено на 5 дн.")
    expect(isUrgent({ status: "received", createdAt: daysAgo(12.5) })).toBe(true)
    expect(isUrgent({ status: "received", createdAt: daysAgo(2) })).toBe(false)
  })
})

describe("signed", () => {
  it("добавляет плюс к росту", () => {
    expect(signed(40)).toBe("+40%")
    expect(signed(-15)).toBe("-15%")
    expect(signed(0)).toBe("0%")
  })
})
