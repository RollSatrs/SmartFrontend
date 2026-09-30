"use client"

import { IconPhotoOff } from "@tabler/icons-react"
import { useState } from "react"
import { photoSrc } from "@/lib/api"
import { cn } from "@/lib/utils"

/** Фото обращения: пока грузится, на фоне мягкий цвет; при ошибке значок вместо битой картинки. */
export function Photo({ url, alt, className }: { url: string | null | undefined; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const src = photoSrc(url)
  return (
    <div className={cn("bg-sage-soft relative overflow-hidden", className)}>
      {src && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" />
      ) : (
        <div className="text-brand flex size-full items-center justify-center">
          <IconPhotoOff className="size-7" aria-hidden />
        </div>
      )}
    </div>
  )
}
