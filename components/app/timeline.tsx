import { formatLong } from "@/lib/format"
import { STATUS_LABEL, type StatusHistoryItem } from "@/lib/types"
import { STATUS_STYLE } from "@/components/app/status-badge"

export function StatusTimeline({ items }: { items: StatusHistoryItem[] }) {
  return (
    <ol className="space-y-0">
      {items.map((item, index) => (
        <li key={item.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1.5 size-2.5 rounded-full" style={{ background: STATUS_STYLE[item.status].dot }} />
            {index < items.length - 1 && <span className="bg-border my-1 w-px flex-1" />}
          </div>
          <div className="pb-5">
            <p className="text-sm font-semibold">{STATUS_LABEL[item.status]}</p>
            <p className="text-muted-foreground text-xs">{formatLong(item.createdAt)}</p>
            {item.comment && <p className="mt-1 text-sm text-pretty">{item.comment}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
