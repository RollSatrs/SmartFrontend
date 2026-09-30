"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { IconClock, IconHandStop, IconInbox, IconSearch, IconTools, IconX } from "@tabler/icons-react"
import { toast } from "sonner"
import { EmptyState, ErrorState, IdeaCardSkeleton } from "@/components/app/states"
import { IdeaCard } from "@/components/app/idea-card"
import { PageHeader } from "@/components/app/shell"
import { Stat } from "@/components/app/stat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { errorText } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { useFeatures } from "@/lib/features"
import { organForSlug } from "@/lib/organs"
import { appeals, isOpen, isUrgent } from "@/lib/format"
import { applyFilters, DEFAULT_FILTERS, takeInWork, type GovFilterState } from "@/lib/gov"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"
import { KIND_LABEL, STATUSES, STATUS_LABEL, type IdeaKind } from "@/lib/types"
import { cn } from "@/lib/utils"

const selectClass =
  "bg-card h-10 rounded-lg border px-3 text-sm font-medium outline-none focus-visible:ring-4 focus-visible:ring-ring/40 aria-[current=true]:border-brand"

export default function GovHome() {
  const { user } = useAuth()
  const { ideaKind } = useFeatures()
  const { data: ideas, setData, loading, error, retry } = useData(() => ideasApi.listAll())
  const [f, setF] = useState<GovFilterState>(DEFAULT_FILTERS)
  const set = <K extends keyof GovFilterState>(key: K, value: GovFilterState[K]) => setF((prev) => ({ ...prev, [key]: value }))

  const all = useMemo(() => ideas ?? [], [ideas])
  const categories = useMemo(() => [...new Set(all.map((i) => i.category?.name).filter(Boolean))].sort() as string[], [all])
  const organs = useMemo(() => [...new Set(all.map((i) => organForSlug(i.category?.slug)?.short).filter(Boolean))].sort() as string[], [all])
  const districts = useMemo(() => [...new Set(all.map((i) => i.addressDistrict))].sort(), [all])
  const shown = useMemo(() => applyFilters(all, f, user?.id), [all, f, user?.id])
  const hasExtra = f.category || f.district || f.organ || f.kind || f.mine || f.urgent || f.search || f.status !== "all"

  async function take(id: number) {
    const idea = all.find((i) => i.id === id)
    if (!idea || !user) return
    try {
      const updated = await takeInWork(idea, user.id)
      setData(all.map((i) => (i.id === updated.id ? updated : i)))
      toast.success("Обращение взято в работу")
    } catch (e) {
      toast.error(errorText(e))
    }
  }

  return (
    <div>
      <PageHeader title="Обращения" description={user ? `${user.name}, вот что пришло от жителей.` : undefined} />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon={IconInbox}
          value={all.filter((i) => i.status === "received").length}
          label="Новые"
          tone="text-muted-foreground"
          active={f.status === "received"}
          onClick={() => set("status", f.status === "received" ? "all" : "received")}
        />
        <Stat
          icon={IconTools}
          value={all.filter((i) => i.status === "in_progress").length}
          label="В работе"
          tone="text-sky-ink"
          active={f.status === "in_progress"}
          onClick={() => set("status", f.status === "in_progress" ? "all" : "in_progress")}
        />
        <Stat
          icon={IconClock}
          value={all.filter((i) => isOpen(i) && isUrgent(i)).length}
          label="Срок горит"
          tone="text-destructive"
          active={f.urgent}
          onClick={() => set("urgent", !f.urgent)}
        />
      </div>

      <div className="mb-5 space-y-3">
        <div className="relative">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-3 left-3 size-4" aria-hidden />
          <Input
            value={f.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Поиск по названию или описанию"
            aria-label="Поиск обращений"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Фильтр по статусу">
          {([["mine", "Мои"], ["all", "Все"], ...STATUSES.map((s) => [s, STATUS_LABEL[s]])] as [string, string][]).map(([key, label]) => {
            const selected = key === "mine" ? f.mine : key === "all" ? f.status === "all" && !f.mine : f.status === key
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  if (key === "mine") set("mine", !f.mine)
                  else setF((prev) => ({ ...prev, status: key as GovFilterState["status"], mine: key === "all" ? false : prev.mine }))
                }}
                className={cn(
                  "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                  selected ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Категория" aria-current={!!f.category} className={selectClass} value={f.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Все категории</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select aria-label="Орган" aria-current={!!f.organ} className={selectClass} value={f.organ} onChange={(e) => set("organ", e.target.value)}>
            <option value="">Все органы</option>
            {organs.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {ideaKind && (
            <select aria-label="Тип" aria-current={!!f.kind} className={selectClass} value={f.kind} onChange={(e) => set("kind", e.target.value as IdeaKind | "")}>
              <option value="">Все типы</option>
              {(Object.keys(KIND_LABEL) as IdeaKind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          )}
          <select aria-label="Район" aria-current={!!f.district} className={selectClass} value={f.district} onChange={(e) => set("district", e.target.value)}>
            <option value="">Все районы</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select aria-label="Сортировка" aria-current={f.sort === "deadline"} className={selectClass} value={f.sort} onChange={(e) => set("sort", e.target.value as GovFilterState["sort"])}>
            <option value="new">Сначала новые</option>
            <option value="deadline">Сначала горящие сроки</option>
          </select>
          {hasExtra && (
            <Button variant="ghost" size="sm" onClick={() => setF(DEFAULT_FILTERS)}>
              <IconX className="size-4" />
              Сбросить
            </Button>
          )}
          <span className="text-muted-foreground tabular ml-auto text-sm">Найдено: {appeals(shown.length)}</span>
        </div>
      </div>

      {loading ? (
        <IdeaCardSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : shown.length === 0 ? (
        <EmptyState title="По выбранным фильтрам обращений нет" hint="Измените фильтры или сбросьте их." />
      ) : (
        <ul className="space-y-3">
          {shown.map((idea) => (
            <li key={idea.id} className="group relative">
              <IdeaCard idea={idea} href={`/gov/ideas/${idea.id}`} showDeadline />
              {isOpen(idea) && idea.assigneeId !== user?.id && (idea.status === "received" || idea.status === "in_review") && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute right-4 bottom-4 hidden opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 sm:inline-flex"
                  onClick={() => void take(idea.id)}
                >
                  <IconHandStop className="size-4" />
                  Взять в работу
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only">
        <Link href="/gov/map">Перейти к карте обращений</Link>
      </p>
    </div>
  )
}
