"use client"

import Link from "next/link"
import { use } from "react"
import { IconArrowLeft, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { ErrorState } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { Stat } from "@/components/app/stat"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth"
import { appeals, formatShort, signed } from "@/lib/format"
import { useData } from "@/lib/hooks"
import { districtsApi } from "@/lib/services"
import { categoryName } from "@/lib/types"

export default function DistrictPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params)
  const district = decodeURIComponent(name)
  const { user } = useAuth()
  const { data, loading, error, retry } = useData(() => districtsApi.detail(district), [district])
  const back = user?.role === "resident" ? "/districts" : "/gov/analytics"
  const up = (data?.weeklyChange.changePercent ?? 0) > 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={back} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <IconArrowLeft className="size-4" aria-hidden />
        {user?.role === "resident" ? "Рейтинг районов" : "Аналитика"}
      </Link>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : error || !data ? (
        <ErrorState message={error || "Район не найден"} onRetry={retry} />
      ) : (
        <>
          <div className="space-y-1">
            <p className="text-brand text-sm font-medium">
              {data.rank} место из {data.totalDistricts}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">{data.district}</h1>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat value={data.score} label="баллов" />
            <Stat value={data.total} label="всего обращений" />
            <Stat value={`${data.resolvedPercent}%`} label="решено" tone="text-primary" />
          </div>
          <div className="bg-card flex items-center gap-3 rounded-2xl border p-4">
            {up ? <IconTrendingUp className="text-destructive size-6" /> : <IconTrendingDown className="text-primary size-6" />}
            <div>
              <p className="text-sm font-semibold">За неделю: {appeals(data.weeklyChange.count)}</p>
              <p className="text-muted-foreground text-xs">
                Было {data.weeklyChange.previousCount}, {signed(data.weeklyChange.changePercent)}
              </p>
            </div>
          </div>
          {data.categories.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-muted-foreground text-sm font-medium">Категории</h2>
              <div className="bg-card space-y-4 rounded-2xl border p-4">
                {data.categories.map((c) => (
                  <div key={c.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{categoryName(c.name)}</span>
                      <span className="text-muted-foreground tabular">
                        {c.count} · {c.percent}%
                      </span>
                    </div>
                    <Progress value={c.percent} aria-label={`${categoryName(c.name)}: ${c.percent}%`} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {data.recentIdeas.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-muted-foreground text-sm font-medium">Последние идеи</h2>
              <ul className="space-y-3">
                {data.recentIdeas.map((idea) => (
                  <li key={idea.id} className="bg-card space-y-2 rounded-2xl border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge status={idea.status} />
                      <time className="text-muted-foreground text-xs" dateTime={idea.createdAt}>
                        {formatShort(idea.createdAt)}
                      </time>
                    </div>
                    <p className="font-semibold text-balance">{idea.title}</p>
                    <p className="text-muted-foreground text-xs">{categoryName(idea.category)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
