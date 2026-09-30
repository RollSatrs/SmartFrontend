export type Role = "resident" | "gov_official" | "admin"

export type AuthUser = {
  id: number
  name: string
  email: string
  role: Role
  avatar: string | null
}

export const STATUSES = [
  "received",
  "in_review",
  "in_progress",
  "done",
  "rejected",
  "needs_clarification",
] as const
export type IdeaStatus = (typeof STATUSES)[number]

export const STATUS_LABEL: Record<IdeaStatus, string> = {
  received: "Получена",
  in_review: "На рассмотрении",
  in_progress: "В работе",
  done: "Завершена",
  rejected: "Отклонена",
  needs_clarification: "Нужны уточнения",
}

/** Следующий шаг обычного пути обращения. У «Завершена» и «Отклонена» следующего шага нет. */
export const NEXT_STEP: Record<IdeaStatus, IdeaStatus | null> = {
  received: "in_review",
  in_review: "in_progress",
  in_progress: "done",
  needs_clarification: "in_review",
  done: null,
  rejected: null,
}

export type PhotoFlag = "consistent" | "inconsistent" | "uncertain"

export type IdeaCategory = { id: number; name: string; slug: string }

export type StatusHistoryItem = {
  id: number
  status: IdeaStatus
  comment: string | null
  changedBy: number
  createdAt: string
}

export type Idea = {
  id: number
  authorId: number
  title: string
  description: string
  category: IdeaCategory | null
  status: IdeaStatus
  lat: number
  lng: number
  addressDistrict: string
  photoUrl: string
  assigneeId: number | null
  assigneeName: string | null
  rating: number | null
  ratingComment: string | null
  afterPhotoUrl: string | null
  photoFlag: PhotoFlag | null
  photoFlagReason: string | null
  createdAt: string
  updatedAt: string
  statusHistory?: StatusHistoryItem[]
}

export type IdeaPage = { items: Idea[]; total: number; page: number; limit: number }

export type GovOfficial = { id: number; name: string; email: string }

export type DistrictRankingEntry = {
  district: string
  total: number
  resolved: number
  resolvedPercent: number
  score: number
}

export type DistrictDetail = {
  district: string
  rank: number
  totalDistricts: number
  score: number
  total: number
  resolved: number
  resolvedPercent: number
  weeklyChange: { count: number; previousCount: number; changePercent: number }
  categories: { name: string; count: number; percent: number }[]
  recentIdeas: { id: number; title: string; status: IdeaStatus; category: string; createdAt: string }[]
}

export type DigestItem = {
  category: string | null
  district: string
  count: number
  previousCount: number
  changePercent: number
}
export type Digest = { items: DigestItem[]; insight: DigestItem | null }

export type ParsedIdea = { title: string; description: string; categorySlug: string | null }

export type AddressResult = { displayName: string; lat: number; lng: number }

/** Категории backend (seed): в дайджесте и рейтинге приходит slug, показываем русское название. */
export const CATEGORY_LABEL: Record<string, string> = {
  roads: "Дороги",
  utilities: "ЖКХ",
  transport: "Транспорт",
  safety: "Безопасность",
  ecology: "Экология",
  improvement: "Благоустройство",
  healthcare: "Здравоохранение",
  education: "Образование",
  other: "Другое",
}

export const categoryName = (value: string | null | undefined) =>
  value ? (CATEGORY_LABEL[value] ?? value) : "Другое"
