"use client"

import Link from "next/link"
import { use, useState } from "react"
import { IconArrowLeft, IconStarFilled } from "@tabler/icons-react"
import { FeedbackDialog } from "@/components/app/feedback-dialog"
import { IdeaDetail } from "@/components/app/idea-detail"
import { ErrorState } from "@/components/app/states"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useData } from "@/lib/hooks"
import { ideasApi } from "@/lib/services"

export default function ResidentIdea({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: idea, setData, loading, error, retry } = useData(() => ideasApi.get(Number(id)), [id])
  const [rating, setRating] = useState(false)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/resident/ideas" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <IconArrowLeft className="size-4" aria-hidden />
        Мои идеи
      </Link>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error || !idea ? (
        <ErrorState message={error || "Идея не найдена"} onRetry={retry} />
      ) : (
        <>
          <IdeaDetail idea={idea} />
          {idea.status === "done" && !idea.rating && (
            <>
              <Button size="lg" className="h-12 w-full" onClick={() => setRating(true)}>
                <IconStarFilled className="size-5" />
                Оценить результат
              </Button>
              <FeedbackDialog open={rating} onOpenChange={setRating} idea={idea} onDone={setData} />
            </>
          )}
        </>
      )}
    </div>
  )
}
