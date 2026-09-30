"use client"

import { IconCheck, IconLock, IconTextPlus } from "@tabler/icons-react"
import { useState } from "react"
import { StatusBadge, STATUS_STYLE } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { errorText } from "@/lib/api"
import { NEXT_STEP, STATUSES, STATUS_LABEL, type IdeaStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Готовые ответы жителю: один клик вместо набора текста. */
export const QUICK_REPLIES: Record<IdeaStatus, string[]> = {
  received: [],
  in_review: ["Обращение принято на рассмотрение", "Передано ответственному специалисту"],
  in_progress: ["Принято в работу", "Выезд специалиста запланирован на этой неделе", "Передано в профильную службу"],
  done: ["Работы выполнены, спасибо за обращение", "Проблема устранена"],
  rejected: ["Вопрос не относится к компетенции органа", "Обращение дублирует ранее поданное", "Недостаточно данных для решения"],
  needs_clarification: ["Уточните адрес или ориентир", "Приложите, пожалуйста, более чёткое фото", "Опишите проблему подробнее"],
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: IdeaStatus
  /** Предвыбранный статус (например, «Отклонена» при быстром действии). */
  initial?: IdeaStatus
  /** Массовое действие: без «сейчас» и «следующего шага». */
  bulkCount?: number
  onSave: (status: IdeaStatus, comment?: string) => Promise<void>
}

export function StatusDialog({ open, onOpenChange, current, initial, bulkCount, onSave }: Props) {
  const next = bulkCount ? null : NEXT_STEP[current]
  const [selected, setSelected] = useState<IdeaStatus | null>(initial ?? next)
  const [comment, setComment] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Status-lock backend: завершённую идею нельзя вернуть «на рассмотрение» или «в работу».
  const locked = (s: IdeaStatus) => !bulkCount && current === "done" && (s === "in_review" || s === "in_progress")
  const commentRequired = selected === "rejected" || selected === "needs_clarification"
  const others = STATUSES.filter((s) => (bulkCount ? true : s !== current && s !== next))
  const canSave =
    !!selected && (bulkCount ? true : selected !== current) && !saving && (!commentRequired || comment.trim().length > 0)

  async function save() {
    if (!selected) return
    setSaving(true)
    setError("")
    try {
      await onSave(selected, comment.trim() || undefined)
      onOpenChange(false)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{bulkCount ? `Статус для обращений: ${bulkCount}` : "Статус обращения"}</DialogTitle>
          <DialogDescription>Житель увидит изменение и комментарий в своём кабинете.</DialogDescription>
        </DialogHeader>

        {!bulkCount && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Сейчас</span>
            <StatusBadge status={current} />
          </div>
        )}

        {next && (
          <button
            type="button"
            onClick={() => setSelected(next)}
            aria-pressed={selected === next}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-colors",
              selected === next ? "border-primary ring-primary/30 ring-2" : "hover:border-brand/40",
            )}
          >
            <span className={cn("flex size-11 items-center justify-center rounded-xl", STATUS_STYLE[next].className)}>
              {(() => {
                const I = STATUS_STYLE[next].icon
                return <I className="size-5" />
              })()}
            </span>
            <span className="flex-1">
              <span className="text-brand block text-[11px] font-semibold tracking-wider uppercase">Следующий шаг</span>
              <span className="font-semibold">{STATUS_LABEL[next]}</span>
            </span>
            {selected === next && <IconCheck className="text-primary size-5" />}
          </button>
        )}

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {bulkCount ? "Новый статус" : next ? "Другое действие" : "Доступные действия"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {others.map((s) => {
              const I = STATUS_STYLE[s].icon
              const isLocked = locked(s)
              return (
                <button
                  key={s}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setSelected(s)}
                  aria-pressed={selected === s}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    selected === s ? cn("border-transparent", STATUS_STYLE[s].className) : "bg-card hover:border-brand/40",
                    isLocked && "cursor-not-allowed opacity-40",
                  )}
                >
                  <I className="size-4 shrink-0" />
                  <span className="flex-1">{STATUS_LABEL[s]}</span>
                  {isLocked && <IconLock className="size-3.5" aria-label="Недоступно" />}
                </button>
              )
            })}
          </div>
          {current === "done" && !bulkCount && (
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <IconLock className="size-3.5" />
              Завершённую идею нельзя вернуть в работу или на рассмотрение.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            {commentRequired ? "Комментарий жителю (обязательно)" : "Комментарий жителю"}
          </label>
          <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Что нужно знать жителю" />
          {selected && QUICK_REPLIES[selected].length > 0 && (
            <div className="space-y-1.5">
              <p className="text-muted-foreground text-xs">Быстрые ответы</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_REPLIES[selected].map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => setComment(reply)}
                    className="bg-sage-soft/70 text-sage-ink hover:bg-sage-soft flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                  >
                    <IconTextPlus className="size-4 shrink-0" />
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="bg-danger-soft text-destructive rounded-lg px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={save} disabled={!canSave}>
            {saving && <Spinner className="size-4" />}
            {selected && (bulkCount || selected !== current) ? `Перевести в «${STATUS_LABEL[selected]}»` : "Выберите действие"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
