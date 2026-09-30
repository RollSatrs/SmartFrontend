import Link from "next/link"
import { IconAlertTriangleFilled, IconClock, IconMapPin, IconUserCheck } from "@tabler/icons-react"
import { Photo } from "@/components/app/photo"
import { StatusBadge } from "@/components/app/status-badge"
import { useStreet } from "@/lib/address"
import { daysLeft, deadlineText, formatShort } from "@/lib/format"
import type { Idea } from "@/lib/types"
import { cn } from "@/lib/utils"

function DeadlineChip({ idea }: { idea: Idea }) {
  const left = daysLeft(idea)
  const text = deadlineText(idea)
  if (left === null || !text) return null
  const tone = left <= 2 ? "bg-danger-soft text-destructive" : left <= 5 ? "bg-gold-soft text-gold-ink" : "bg-muted text-muted-foreground"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", tone)}>
      <IconClock className="size-3.5" aria-hidden />
      {text}
    </span>
  )
}

export function IdeaCard({ idea, href, showDeadline = false }: { idea: Idea; href: string; showDeadline?: boolean }) {
  const street = useStreet(idea.lat, idea.lng)
  return (
    <Link
      href={href}
      className="bg-card hover:border-brand/40 focus-visible:ring-ring/50 group flex gap-4 rounded-2xl border p-3.5 shadow-[0_1px_2px_rgb(51_71_62/0.04)] transition-[border-color,box-shadow,transform] hover:shadow-[0_6px_20px_rgb(51_71_62/0.08)] focus-visible:ring-4 focus-visible:outline-none active:scale-[0.995] sm:p-4"
    >
      <Photo url={idea.photoUrl} alt="" className="size-20 shrink-0 rounded-xl sm:size-24" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={idea.status} />
          {showDeadline && <DeadlineChip idea={idea} />}
          {idea.photoFlag === "inconsistent" && (
            <span className="text-destructive inline-flex items-center gap-1 text-xs font-medium" title="ИИ: фото может не соответствовать описанию">
              <IconAlertTriangleFilled className="size-3.5" aria-hidden />
              Проверить фото
            </span>
          )}
          <time className="text-muted-foreground ml-auto text-xs" dateTime={idea.createdAt}>
            {formatShort(idea.createdAt)}
          </time>
        </div>
        <h3 className="line-clamp-2 text-[15px]/5 font-semibold text-balance group-hover:underline group-hover:decoration-brand/40 group-hover:underline-offset-4">
          {idea.title}
        </h3>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
          {idea.category && (
            <span className="bg-sage-soft text-sage-ink rounded-full px-2 py-0.5 text-xs font-medium">{idea.category.name}</span>
          )}
          <span className="inline-flex items-center gap-1">
            <IconMapPin className="size-3.5" aria-hidden />
            {street ? `${street} · ${idea.addressDistrict}` : idea.addressDistrict}
          </span>
          {idea.assigneeName && (
            <span className="text-brand inline-flex items-center gap-1 font-medium">
              <IconUserCheck className="size-3.5" aria-hidden />
              {idea.assigneeName}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
