import { IconMapPinFilled } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
    >
      <IconMapPinFilled className="size-5" aria-hidden />
    </span>
  )
}

export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight">Smart City</span>
        <span className="text-muted-foreground text-xs">Область Абай</span>
      </span>
    </span>
  )
}
