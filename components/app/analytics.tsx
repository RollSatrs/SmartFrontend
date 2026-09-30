"use client"

import Link from "next/link"
import { useMemo } from "react"
import { IconChevronRight, IconClockExclamation, IconSparkles, IconTrendingDown, IconTrendingUp, IconTrophy, IconUsers } from "@tabler/icons-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { EmptyState, ErrorState } from "@/components/app/states"
import { Stat } from "@/components/app/stat"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { appeals, daysLeft, isOpen, isOverdue, isUrgent, signed } from "@/lib/format"
import { useData } from "@/lib/hooks"
import { districtsApi, ideasApi } from "@/lib/services"
import { categoryName, type Idea } from "@/lib/types"

const PALETTE = ["#5b8570", "#c9a24f", "#e0a88f", "#8fa8c9", "#b59bc9", "#7fb5b5", "#c9b48f", "#a3a3a3"]

function Loading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}

export function WeekReport() {
  const { data, loading, error, retry } = useData(ideasApi.digest)
  const slices = useMemo(() => {
    const totals = new Map<string, number>()
    for (const item of data?.items ?? []) {
      const name = categoryName(item.category)
      totals.set(name, (totals.get(name) ?? 0) + item.count)
    }
    return [...totals.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"))
  }, [data])
  const total = slices.reduce((sum, s) => sum + s.count, 0)

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={retry} />
  if (!data || slices.length === 0) return <EmptyState title="За неделю пока нет обращений" icon={IconSparkles} />

  const trends = [...data.items].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6)
  const insight = data.insight

  return (
    <div className="space-y-6">
      {insight && (
        <div className="bg-amber-soft flex items-start gap-3 rounded-2xl p-4">
          <IconSparkles className="text-amber-ink mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-amber-ink text-sm font-semibold">Главное за неделю</p>
            <p className="text-sm text-pretty">
              {categoryName(insight.category)} · {insight.district}: {appeals(insight.count)}, {signed(insight.changePercent)} к прошлой неделе
              (было {insight.previousCount})
            </p>
          </div>
        </div>
      )}

      <div className="bg-card grid gap-6 rounded-2xl border p-5 md:grid-cols-[minmax(0,18rem)_1fr] md:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="count" nameKey="name" innerRadius="62%" outerRadius="100%" paddingAngle={2} cornerRadius={6} stroke="none">
                {slices.map((s, i) => (
                  <Cell key={s.name} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => appeals(v)} contentStyle={{ borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular text-4xl font-semibold">{total}</span>
            <span className="text-muted-foreground text-xs">обращений</span>
          </div>
        </div>
        <ul className="space-y-3">
          {slices.map((s, i) => (
            <li key={s.name} className="flex items-center gap-3 text-sm">
              <span className="size-3 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="flex-1 font-medium">{s.name}</span>
              <span className="text-muted-foreground tabular">{s.count}</span>
              <span className="tabular w-12 text-right font-semibold">{Math.round((s.count / Math.max(total, 1)) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>

      <section className="space-y-3">
        <h2 className="text-muted-foreground text-sm font-medium">Проблемные направления</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {trends.map((t) => {
            const up = t.changePercent > 0
            return (
              <li key={`${t.category}-${t.district}`} className="bg-card flex items-center gap-3 rounded-2xl border p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {categoryName(t.category)} · {t.district}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {appeals(t.count)}, было {t.previousCount}
                  </p>
                </div>
                <span className={`tabular inline-flex items-center gap-1 text-sm font-semibold ${up ? "text-destructive" : "text-primary"}`}>
                  {up ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                  {signed(t.changePercent)}
                </span>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

export function DistrictsRanking() {
  const { data, loading, error, retry } = useData(districtsApi.ranking)
  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={retry} />
  if (!data || data.length === 0) return <EmptyState title="Рейтинг появится, когда будут первые идеи" icon={IconTrophy} />

  return (
    <div className="space-y-5">
      <div className="bg-muted flex items-center gap-4 rounded-2xl p-4">
        <span className="bg-card text-gold flex size-12 items-center justify-center rounded-xl">
          <IconTrophy className="size-6" />
        </span>
        <div>
          <p className="text-muted-foreground text-xs font-medium">Самый отзывчивый район месяца</p>
          <p className="text-xl font-semibold">{data[0].district}</p>
        </div>
      </div>
      <ol className="space-y-3">
        {data.map((entry, index) => (
          <li key={entry.district}>
            <Link
              href={`/districts/${encodeURIComponent(entry.district)}`}
              className="bg-card hover:border-brand/40 block space-y-3 rounded-2xl border p-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className={`tabular flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${index === 0 ? "bg-gold-soft text-gold-ink" : "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{entry.district}</p>
                  <p className="text-muted-foreground text-xs">
                    {entry.resolved} из {entry.total} решено · {entry.resolvedPercent}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-xl font-semibold">{entry.score}</p>
                  <p className="text-muted-foreground text-[11px]">баллов</p>
                </div>
                <IconChevronRight className="text-muted-foreground size-4" aria-hidden />
              </div>
              <Progress value={entry.resolvedPercent} aria-label={`Решено ${entry.resolvedPercent}%`} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

type Row = { id: number; name: string; active: number; urgent: number; done: number; avgDays: number | null }

function buildRows(ideas: Idea[]): Row[] {
  const byAssignee = new Map<number, Idea[]>()
  for (const idea of ideas) {
    if (idea.assigneeId == null) continue
    byAssignee.set(idea.assigneeId, [...(byAssignee.get(idea.assigneeId) ?? []), idea])
  }
  return [...byAssignee.entries()]
    .map(([id, list]) => {
      const closed = list.filter((i) => i.status === "done")
      const durations = closed.map((i) => Math.max(0, (new Date(i.updatedAt).getTime() - new Date(i.createdAt).getTime()) / 86_400_000))
      return {
        id,
        name: list[0].assigneeName ?? "Сотрудник",
        active: list.filter(isOpen).length,
        urgent: list.filter((i) => isOpen(i) && isUrgent(i)).length,
        done: closed.length,
        avgDays: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
      }
    })
    .sort((a, b) => b.active - a.active || a.name.localeCompare(b.name, "ru"))
}

export function TeamLoad() {
  const { data, loading, error, retry } = useData(() => ideasApi.listAll())
  const ideas = useMemo(() => data ?? [], [data])
  const rows = useMemo(() => buildRows(ideas), [ideas])
  const maxActive = Math.max(1, ...rows.map((r) => r.active))
  const unassigned = ideas.filter((i) => isOpen(i) && i.assigneeId == null).length
  const overdue = ideas.filter(isOverdue).length

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} onRetry={retry} />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={IconUsers} value={unassigned} label="Без исполнителя" tone={unassigned > 0 ? "text-destructive" : "text-primary"} />
        <Stat icon={IconClockExclamation} value={overdue} label="Просрочено" tone={overdue > 0 ? "text-destructive" : "text-primary"} />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Пока никому не назначено ни одного обращения" icon={IconUsers} />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="bg-card space-y-4 rounded-2xl border p-4">
              <div className="flex items-center gap-3">
                <span className="bg-sage-soft text-sage-ink flex size-10 items-center justify-center rounded-full font-semibold">{r.name.slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.name}</p>
                  <p className="text-muted-foreground text-xs">В работе: {r.active}</p>
                </div>
                {r.urgent > 0 && (
                  <span className="bg-danger-soft text-destructive inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
                    <IconClockExclamation className="size-3.5" />
                    {r.urgent} горит
                  </span>
                )}
              </div>
              <Progress value={(r.active / maxActive) * 100} aria-label={`Нагрузка: ${r.active}`} />
              <dl className="flex justify-between text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">Завершено</dt>
                  <dd className="tabular font-semibold">{r.done}</dd>
                </div>
                <div className="text-right">
                  <dt className="text-muted-foreground text-xs">Среднее время</dt>
                  <dd className="tabular font-semibold">{r.avgDays == null ? "нет данных" : `${r.avgDays.toFixed(1)} дн.`}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { daysLeft }
