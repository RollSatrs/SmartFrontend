import { api } from "@/lib/api"
import { daysLeft, isOpen, isUrgent } from "@/lib/format"
import { ideasApi } from "@/lib/services"
import type { Idea, IdeaStatus } from "@/lib/types"

export type GovFilterState = {
  search: string
  status: IdeaStatus | "all"
  category: string
  district: string
  mine: boolean
  urgent: boolean
  sort: "new" | "deadline"
}

export const DEFAULT_FILTERS: GovFilterState = {
  search: "",
  status: "all",
  category: "",
  district: "",
  mine: false,
  urgent: false,
  sort: "new",
}

export function applyFilters(ideas: Idea[], f: GovFilterState, myId: number | undefined): Idea[] {
  const q = f.search.trim().toLowerCase()
  const list = ideas.filter((idea) => {
    if (f.status !== "all" && idea.status !== f.status) return false
    if (f.category && idea.category?.name !== f.category) return false
    if (f.district && idea.addressDistrict !== f.district) return false
    if (f.mine && idea.assigneeId !== myId) return false
    if (f.urgent && !isUrgent(idea)) return false
    if (q && !`${idea.title} ${idea.description}`.toLowerCase().includes(q)) return false
    return true
  })
  if (f.sort === "deadline") {
    return [...list].sort((a, b) => (daysLeft(a) ?? Infinity) - (daysLeft(b) ?? Infinity) || a.id - b.id)
  }
  return list
}

/** «Взять в работу»: назначает сотрудника и, если идея ещё не в работе, переводит её в «В работе». */
export async function takeInWork(idea: Idea, myId: number): Promise<Idea> {
  let updated = await ideasApi.assign(idea.id, myId)
  if (updated.status === "received" || updated.status === "in_review") {
    updated = await ideasApi.updateStatus(idea.id, "in_progress")
  }
  // Ответы PATCH могут не содержать историю статусов, поэтому перечитываем карточку целиком.
  return ideasApi.get(idea.id).catch(() => updated)
}

export async function changeStatus(idea: Idea, status: IdeaStatus, comment?: string): Promise<Idea> {
  const updated = await ideasApi.updateStatus(idea.id, status, comment)
  return ideasApi.get(idea.id).catch(() => updated)
}

export const isOpenIdea = isOpen
export { api }
