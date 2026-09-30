"use client"

import Link from "next/link"
import { use, useState } from "react"
import { IconArrowLeft, IconArrowsExchange, IconHandStop, IconUserPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import { AssignDialog } from "@/components/app/assign-dialog"
import { IdeaDetail } from "@/components/app/idea-detail"
import { ErrorState } from "@/components/app/states"
import { StatusDialog } from "@/components/app/status-dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { errorText } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { changeStatus, takeInWork } from "@/lib/gov"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"

export default function GovIdea({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const { data: idea, setData, loading, error, retry } = useData(() => ideasApi.get(Number(id)), [id])
  const [statusOpen, setStatusOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function take() {
    if (!idea || !user) return
    setBusy(true)
    try {
      setData(await takeInWork(idea, user.id))
      toast.success("Обращение взято в работу")
    } catch (e) {
      toast.error(errorText(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/gov" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <IconArrowLeft className="size-4" aria-hidden />
        Обращения
      </Link>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error || !idea ? (
        <ErrorState message={error || "Обращение не найдено"} onRetry={retry} />
      ) : (
        <>
          <IdeaDetail idea={idea} showAi />

          <section className="bg-card space-y-4 rounded-2xl border p-5" aria-labelledby="assignee-title">
            <div>
              <h2 id="assignee-title" className="text-muted-foreground text-sm font-medium">
                Ответственный
              </h2>
              <p className={idea.assigneeName ? "text-lg font-semibold" : "text-muted-foreground text-lg"}>
                {idea.assigneeName ?? "Пока не назначен"}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {idea.assigneeId !== user?.id && idea.status !== "done" && idea.status !== "rejected" && (
                <Button size="lg" className="h-11 sm:col-span-2" onClick={take} disabled={busy}>
                  {busy ? <Spinner className="size-5" /> : <IconHandStop className="size-5" />}
                  Взять в работу
                </Button>
              )}
              <Button variant="secondary" size="lg" className="h-11" onClick={() => setAssignOpen(true)}>
                <IconUserPlus className="size-5" />
                {idea.assigneeName ? "Назначить другого" : "Назначить сотрудника"}
              </Button>
              <Button variant="secondary" size="lg" className="h-11" onClick={() => setStatusOpen(true)}>
                <IconArrowsExchange className="size-5" />
                Изменить статус
              </Button>
            </div>
          </section>

          <StatusDialog
            key={`${idea.id}-${idea.status}`}
            open={statusOpen}
            onOpenChange={setStatusOpen}
            current={idea.status}
            onSave={async (status, comment) => {
              setData(await changeStatus(idea, status, comment))
              toast.success("Статус обновлён")
            }}
          />
          <AssignDialog
            open={assignOpen}
            onOpenChange={setAssignOpen}
            currentId={idea.assigneeId}
            onPick={async (officialId) => {
              await ideasApi.assign(idea.id, officialId)
              setData(await ideasApi.get(idea.id))
              toast.success("Сотрудник назначен")
            }}
          />
        </>
      )}
    </div>
  )
}
