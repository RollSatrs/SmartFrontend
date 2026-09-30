"use client"

import { IconCircleCheckFilled, IconUserCircle } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { EmptyState, ErrorState } from "@/components/app/states"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { errorText } from "@/lib/api"
import { usersApi } from "@/lib/services"
import type { GovOfficial } from "@/lib/types"

export function AssignDialog({
  open,
  onOpenChange,
  currentId,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentId: number | null
  onPick: (officialId: number) => Promise<void>
}) {
  const [officials, setOfficials] = useState<GovOfficial[] | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    if (!open || officials) return
    usersApi
      .govOfficials()
      .then(setOfficials)
      .catch((e) => setError(errorText(e)))
  }, [open, officials])

  async function pick(id: number) {
    setSaving(id)
    setError("")
    try {
      await onPick(id)
      onOpenChange(false)
    } catch (e) {
      setError(errorText(e))
    } finally {
      setSaving(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Назначить сотрудника</DialogTitle>
          <DialogDescription>Ответственный увидит обращение в своём списке.</DialogDescription>
        </DialogHeader>
        {!officials && !error ? (
          <div className="flex justify-center py-8">
            <Spinner className="text-brand size-6" />
          </div>
        ) : officials && officials.length === 0 ? (
          <EmptyState title="Сотрудников пока нет" icon={IconUserCircle} />
        ) : officials ? (
          <ul className="space-y-2">
            {officials.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => pick(o.id)}
                  className="hover:border-brand/40 flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60"
                >
                  <IconUserCircle className="text-brand size-8 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{o.name}</span>
                    <span className="text-muted-foreground block truncate text-xs">{o.email}</span>
                  </span>
                  {saving === o.id ? <Spinner className="size-4" /> : currentId === o.id ? <IconCircleCheckFilled className="text-primary size-5" /> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {error && <ErrorState message={error} />}
      </DialogContent>
    </Dialog>
  )
}
