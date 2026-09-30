"use client"

import { PageHeader } from "@/components/app/shell"
import { DistrictsRanking, TeamLoad, WeekReport } from "@/components/app/analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Analytics() {
  return (
    <div>
      <PageHeader title="Аналитика" description="Отчёт недели, рейтинг районов и нагрузка сотрудников." />
      <Tabs defaultValue="week">
        <TabsList className="mb-6">
          <TabsTrigger value="week">Неделя</TabsTrigger>
          <TabsTrigger value="districts">Районы</TabsTrigger>
          <TabsTrigger value="team">Команда</TabsTrigger>
        </TabsList>
        <TabsContent value="week">
          <WeekReport />
        </TabsContent>
        <TabsContent value="districts">
          <DistrictsRanking />
        </TabsContent>
        <TabsContent value="team">
          <TeamLoad />
        </TabsContent>
      </Tabs>
    </div>
  )
}
