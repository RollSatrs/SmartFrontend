import {
  IconCircleCheck,
  IconCircleX,
  IconFileSearch,
  IconHelpCircle,
  IconInbox,
  IconTools,
  type Icon,
} from "@tabler/icons-react"
import { STATUS_LABEL, type IdeaStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

export const STATUS_STYLE: Record<IdeaStatus, { className: string; dot: string; icon: Icon }> = {
  received: { className: "bg-muted text-muted-foreground", dot: "#7a8a82", icon: IconInbox },
  in_review: { className: "bg-gold-soft text-gold-ink", dot: "#c9a24f", icon: IconFileSearch },
  in_progress: { className: "bg-sky-soft text-sky-ink", dot: "#3b7fb5", icon: IconTools },
  done: { className: "bg-sage-soft text-sage-ink", dot: "#4b7361", icon: IconCircleCheck },
  rejected: { className: "bg-danger-soft text-destructive", dot: "#bc5a45", icon: IconCircleX },
  needs_clarification: { className: "bg-amber-soft text-amber-ink", dot: "#c77a2a", icon: IconHelpCircle },
}

export function StatusBadge({ status, className }: { status: IdeaStatus; className?: string }) {
  const { className: tone, icon: StatusIcon } = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <StatusIcon className="size-3.5" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  )
}
