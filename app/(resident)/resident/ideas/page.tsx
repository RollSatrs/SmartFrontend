"use client"

import Link from "next/link"
import { useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import { EmptyState, ErrorState, IdeaCardSkeleton } from "@/components/app/states"
import { IdeaCard } from "@/components/app/idea-card"
import { PageHeader } from "@/components/app/shell"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isOpen } from "@/lib/format"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"

const FILTERS = { all: "Все", active: "Активные", done: "Решено" } as const
type Filter = keyof typeof FILTERS

export default function MyIdeas() {
  const { data: ideas, loading, error, retry } = useData(ideasApi.listMine)
  const [filter, setFilter] = useState<Filter>("all")

  const shown = (ideas ?? []).filter((i) => (filter === "all" ? true : filter === "active" ? isOpen(i) : i.status === "done"))

  return (
    <div>
      <PageHeader
        title="Мои идеи"
        description="Все ваши обращения и их статусы."
        action={
          <Button asChild>
            <Link href="/resident/new">
              <IconPlus className="size-4" />
              Подать идею
            </Link>
          </Button>
        }
      />
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)} className="mb-5">
        <TabsList>
          {(Object.keys(FILTERS) as Filter[]).map((key) => (
            <TabsTrigger key={key} value={key}>
              {FILTERS[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {loading ? (
        <IdeaCardSkeleton count={4} />
      ) : error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : shown.length === 0 ? (
        <EmptyState title={ideas?.length ? "В этом разделе пока пусто" : "Пока нет идей"} hint={ideas?.length ? undefined : "Подайте первую идею, и она появится здесь."} />
      ) : (
        <div className="space-y-3">
          {shown.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} href={`/ideas/${idea.id}`} />
          ))}
        </div>
      )}
    </div>
  )
}
