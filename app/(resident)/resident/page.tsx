"use client"

import Link from "next/link"
import { IconArrowRight, IconBulb, IconCircleCheck, IconClock, IconFileText, IconPlus, IconSparkles, IconStar } from "@tabler/icons-react"
import { EmptyState, ErrorState, IdeaCardSkeleton } from "@/components/app/states"
import { IdeaCard } from "@/components/app/idea-card"
import { Stat } from "@/components/app/stat"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"
import { isOpen } from "@/lib/format"

export default function ResidentHome() {
  const { user } = useAuth()
  const { data: ideas, loading, error, retry } = useData(ideasApi.listMine)
  const firstName = user?.name.split(" ")[0] ?? "Житель"
  const active = ideas?.filter(isOpen).length ?? 0
  const done = ideas?.filter((i) => i.status === "done").length ?? 0
  const awaiting = ideas?.find((i) => i.status === "done" && !i.rating)

  return (
    <div className="space-y-8">
      <section className="bg-sage-soft grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[1.4fr_1fr] md:items-center">
        <div className="space-y-4">
          <p className="text-sage-ink flex items-center gap-2 text-sm font-medium">
            <IconBulb className="size-4" aria-hidden />
            Здравствуйте, {firstName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">Сделаем область лучше вместе</h1>
          <p className="text-muted-foreground max-w-[52ch] text-pretty">
            Опишите проблему, добавьте фото и отметьте место на карте. Это займёт несколько минут.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-12 text-base">
            <Link href="/resident/new">
              <IconPlus className="size-5" />
              Подать идею
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-card h-12 text-base">
            <Link href="/resident/new?ai=1">
              <IconSparkles className="size-5" />
              Описать с помощью ИИ
            </Link>
          </Button>
        </div>
      </section>

      {awaiting && (
        <Link
          href={`/ideas/${awaiting.id}`}
          className="bg-amber-soft hover:ring-gold/40 flex items-center gap-4 rounded-2xl p-4 transition-shadow hover:ring-2"
        >
          <span className="bg-card text-gold flex size-11 shrink-0 items-center justify-center rounded-xl">
            <IconStar className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold">Оцените результат</span>
            <span className="text-muted-foreground line-clamp-1 text-sm">Работа по идее «{awaiting.title}» завершена</span>
          </span>
          <IconArrowRight className="text-amber-ink size-5" />
        </Link>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Stat icon={IconFileText} value={ideas?.length ?? 0} label="Всего идей" tone="text-brand" />
        <Stat icon={IconClock} value={active} label="В работе" tone="text-sky-ink" />
        <Stat icon={IconCircleCheck} value={done} label="Решено" tone="text-primary" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Последние идеи</h2>
          {ideas && ideas.length > 3 && (
            <Link href="/resident/ideas" className="text-brand text-sm font-medium hover:underline">
              Все идеи
            </Link>
          )}
        </div>
        {loading ? (
          <IdeaCardSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={retry} />
        ) : ideas && ideas.length > 0 ? (
          <div className="space-y-3">
            {ideas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} href={`/ideas/${idea.id}`} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Пока нет идей"
            hint="Подайте первую: фото проблемы, точка на карте и пара слов."
            action={
              <Button asChild>
                <Link href="/resident/new">Подать идею</Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  )
}
