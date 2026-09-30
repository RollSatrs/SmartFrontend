"use client"

import { IconPhotoPlus, IconStar, IconStarFilled } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { errorText } from "@/lib/api"
import { ideasApi, uploadPhoto } from "@/lib/services"
import type { Idea } from "@/lib/types"
import { cn } from "@/lib/utils"

export function FeedbackDialog({
  open,
  onOpenChange,
  idea,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  idea: Idea
  onDone: (idea: Idea) => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function submit() {
    setSaving(true)
    setError("")
    try {
      const afterPhotoUrl = file ? await uploadPhoto(file) : undefined
      const updated = await ideasApi.feedback(idea.id, { rating, comment: comment.trim() || undefined, afterPhotoUrl })
      onDone(updated)
      onOpenChange(false)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Оцените результат</DialogTitle>
          <DialogDescription className="text-pretty">Насколько вы довольны решением по идее «{idea.title}»?</DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="Оценка" className="flex justify-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((n) => {
            const Star = n <= rating ? IconStarFilled : IconStar
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} из 5`}
                onClick={() => setRating(n)}
                className="rounded-md p-1 transition-transform active:scale-90"
              >
                <Star className={cn("size-9", n <= rating ? "text-gold" : "text-muted-foreground/50")} />
              </button>
            )
          })}
        </div>

        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Комментарий (необязательно)" aria-label="Комментарий" />

        <label className="hover:border-brand/40 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 text-sm transition-colors">
          <IconPhotoPlus className="text-brand size-5" />
          <span className="flex-1">{file ? file.name : "Фото «после» (необязательно)"}</span>
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        {error && (
          <p role="alert" className="bg-danger-soft text-destructive rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={rating === 0 || saving}>
            {saving && <Spinner className="size-4" />}
            Отправить оценку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
