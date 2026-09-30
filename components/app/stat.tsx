import { cn } from "@/lib/utils"

export function Stat({
  value,
  label,
  icon: Icon,
  tone = "text-foreground",
  onClick,
  active,
}: {
  value: number | string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  tone?: string
  onClick?: () => void
  active?: boolean
}) {
  const Wrapper = onClick ? "button" : "div"
  return (
    <Wrapper
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
      className={cn(
        "bg-card flex flex-col items-start gap-2 rounded-2xl border p-4 text-left shadow-[0_1px_2px_rgb(51_71_62/0.04)]",
        onClick && "hover:border-brand/40 cursor-pointer transition-colors",
        active && "border-brand ring-brand/30 ring-2",
      )}
    >
      {Icon && <Icon className={cn("size-5", tone)} />}
      <span className={cn("tabular text-3xl font-semibold tracking-tight", tone)}>{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </Wrapper>
  )
}
