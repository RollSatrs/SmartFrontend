"use client"

import { PageHeader } from "@/components/app/shell"
import { DistrictsRanking } from "@/components/app/analytics"

export default function DistrictsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Рейтинг районов" description="Где обращения решаются быстрее всего. Нажмите на район, чтобы увидеть подробности." />
      <DistrictsRanking />
    </div>
  )
}
