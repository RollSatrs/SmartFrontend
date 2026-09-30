import { IconAlertTriangle, IconInbox } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  hint,
  icon: Icon = IconInbox,
  action,
  className,
}: {
  title: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
        <Icon className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {hint && <p className="text-muted-foreground mx-auto max-w-sm text-sm text-pretty">{hint}</p>}
      </div>
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="bg-danger-soft text-destructive flex size-12 items-center justify-center rounded-2xl">
        <IconAlertTriangle className="size-6" />
      </span>
      <p className="text-destructive max-w-sm text-sm text-pretty">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Повторить
        </Button>
      )}
    </div>
  )
}

/** Скелет повторяет форму карточки обращения, чтобы страница не прыгала после загрузки. */
export function IdeaCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card flex gap-4 rounded-2xl border p-4">
          <Skeleton className="size-24 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3 py-1">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
