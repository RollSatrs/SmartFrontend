"use client"

import dynamic from "next/dynamic"
import {
  IconAlertTriangleFilled,
  IconCalendar,
  IconCategory,
  IconHelpCircleFilled,
  IconMapPin,
  IconRosetteDiscountCheckFilled,
  IconSignRight,
  IconStarFilled,
  IconUserCheck,
  IconBuilding,
  IconExternalLink,
} from "@tabler/icons-react"
import { Photo } from "@/components/app/photo"
import { StatusBadge } from "@/components/app/status-badge"
import { StatusTimeline } from "@/components/app/timeline"
import { Skeleton } from "@/components/ui/skeleton"
import { useStreet } from "@/lib/address"
import { formatLong } from "@/lib/format"
import type { Idea } from "@/lib/types"
import { cn } from "@/lib/utils"

const MapView = dynamic(() => import("@/components/app/map/view"), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
})

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className="text-brand mt-0.5 size-5 shrink-0" />
      <div className="min-w-0">
        <dt className="text-muted-foreground text-xs">{label}</dt>
        <dd className="text-sm font-medium text-pretty">{value}</dd>
      </div>
    </div>
  )
}

function AiCheck({ idea }: { idea: Idea }) {
  const variants = {
    inconsistent: {
      tone: "bg-danger-soft text-destructive",
      icon: IconAlertTriangleFilled,
      title: "ИИ: фото может не соответствовать описанию",
      text: idea.photoFlagReason,
    },
    uncertain: {
      tone: "bg-gold-soft text-gold-ink",
      icon: IconHelpCircleFilled,
      title: "ИИ не смог проверить фото",
      text: idea.photoFlagReason ?? "Фото недоступно для анализа. Проверьте вручную.",
    },
    consistent: {
      tone: "bg-sage-soft text-sage-ink",
      icon: IconRosetteDiscountCheckFilled,
      title: "ИИ: фото соответствует описанию",
      text: idea.photoFlagReason,
    },
  } as const
  if (!idea.photoFlag) return null
  const v = variants[idea.photoFlag]
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl p-4", v.tone)}>
      <v.icon className="mt-0.5 size-5 shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-semibold">{v.title}</p>
        {v.text && <p className="text-sm text-pretty opacity-90">{v.text}</p>}
      </div>
    </div>
  )
}

/** Общая часть карточки обращения: для жителя и для госоргана. */
export function IdeaDetail({ idea, showAi = false }: { idea: Idea; showAi?: boolean }) {
  const street = useStreet(idea.lat, idea.lng)
  const mapsUrl = `https://www.openstreetmap.org/?mlat=${idea.lat}&mlon=${idea.lng}#map=17/${idea.lat}/${idea.lng}`

  return (
    <div className="space-y-6">
      <Photo url={idea.photoUrl} alt={`Фото: ${idea.title}`} className="aspect-[16/9] w-full rounded-2xl sm:aspect-[2/1]" />

      <div className="space-y-3">
        <StatusBadge status={idea.status} />
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{idea.title}</h1>
        <p className="text-muted-foreground max-w-[65ch] text-pretty whitespace-pre-line">{idea.description}</p>
      </div>

      {showAi && <AiCheck idea={idea} />}

      <dl className="bg-card divide-y rounded-2xl border p-4">
        <Row icon={IconCategory} label="Категория" value={idea.category?.name ?? "Определяется"} />
        <Row icon={IconSignRight} label="Адрес" value={street ?? "Определяется"} />
        <Row icon={IconBuilding} label="Район" value={idea.addressDistrict} />
        <Row icon={IconCalendar} label="Создана" value={formatLong(idea.createdAt)} />
        {idea.assigneeName && <Row icon={IconUserCheck} label="Ответственный" value={idea.assigneeName} />}
      </dl>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
            <IconMapPin className="size-4" aria-hidden />
            Место на карте
          </h2>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-brand inline-flex items-center gap-1 text-sm font-medium hover:underline">
            Открыть на карте
            <IconExternalLink className="size-4" aria-hidden />
          </a>
        </div>
        <MapView lat={idea.lat} lng={idea.lng} />
        <p className="text-muted-foreground tabular text-xs">
          {idea.lat.toFixed(5)}, {idea.lng.toFixed(5)}
        </p>
      </section>

      {(idea.rating || idea.afterPhotoUrl) && (
        <section className="bg-amber-soft space-y-3 rounded-2xl p-4">
          <h2 className="text-amber-ink text-sm font-semibold">Оценка жителя</h2>
          {idea.rating ? (
            <div className="flex gap-1" aria-label={`Оценка ${idea.rating} из 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <IconStarFilled key={n} className={cn("size-5", n <= idea.rating! ? "text-gold" : "text-border")} />
              ))}
            </div>
          ) : null}
          {idea.ratingComment && <p className="text-sm text-pretty">{idea.ratingComment}</p>}
          {idea.afterPhotoUrl && <Photo url={idea.afterPhotoUrl} alt="Фото после выполнения работ" className="aspect-[16/9] w-full rounded-xl" />}
        </section>
      )}

      {idea.statusHistory && idea.statusHistory.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-medium">История статусов</h2>
          <div className="bg-card rounded-2xl border p-4 pb-0">
            <StatusTimeline items={idea.statusHistory} />
          </div>
        </section>
      )}
    </div>
  )
}
