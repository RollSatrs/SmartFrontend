"use client"

import dynamic from "next/dynamic"
import { useMemo, useRef, useState } from "react"
import { IconArrowsMaximize, IconCurrentLocation } from "@tabler/icons-react"
import type { MapHandle } from "@/components/app/map/ideas-map"
import { IdeaCard } from "@/components/app/idea-card"
import { STATUS_STYLE } from "@/components/app/status-badge"
import { ErrorState } from "@/components/app/states"
import { PageHeader } from "@/components/app/shell"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { appeals } from "@/lib/format"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"
import { STATUSES, STATUS_LABEL, type IdeaStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const IdeasMap = dynamic(() => import("@/components/app/map/ideas-map"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
})

export default function GovMap() {
  const { data: ideas, loading, error, retry } = useData(() => ideasApi.listAll())
  const [status, setStatus] = useState<IdeaStatus | "all">("all")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const handle = useRef<MapHandle | null>(null)

  const shown = useMemo(() => (ideas ?? []).filter((i) => status === "all" || i.status === status), [ideas, status])
  const selected = shown.find((i) => i.id === selectedId) ?? null

  return (
    <div>
      <PageHeader title="Карта обращений" description={`На карте: ${appeals(shown.length)}. Нажмите на метку, чтобы открыть обращение.`} />
      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Фильтр по статусу">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                  status === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {s !== "all" && <span className="size-2.5 rounded-full" style={{ background: STATUS_STYLE[s].dot }} />}
                {s === "all" ? "Все" : STATUS_LABEL[s]}
              </button>
            ))}
          </div>

          <div className="relative h-[calc(100dvh-16rem)] min-h-[420px] overflow-hidden rounded-2xl border">
            {loading ? (
              <Skeleton className="size-full" />
            ) : (
              <IdeasMap ideas={shown} selectedId={selectedId} onSelect={setSelectedId} onReady={(h) => (handle.current = h)} />
            )}
            <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
              <Button size="icon" variant="secondary" className="shadow-md" aria-label="Показать Семей" onClick={() => handle.current?.fitCity()}>
                <IconCurrentLocation className="size-5" />
              </Button>
              <Button size="icon" variant="secondary" className="shadow-md" aria-label="Показать все обращения" onClick={() => handle.current?.fitAll()}>
                <IconArrowsMaximize className="size-5" />
              </Button>
            </div>
            {selected && (
              <div className="absolute inset-x-3 bottom-3 z-[500] max-w-xl">
                <IdeaCard idea={selected} href={`/gov/ideas/${selected.id}`} showDeadline />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
