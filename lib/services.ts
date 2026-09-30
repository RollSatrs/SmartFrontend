import { api } from "@/lib/api"
import type {
  AddressResult,
  AuthUser,
  Digest,
  DistrictDetail,
  DistrictRankingEntry,
  GovOfficial,
  Idea,
  IdeaPage,
  IdeaKind,
  IdeaStatus,
  ParsedIdea,
  Role,
} from "@/lib/types"

type AuthResponse = { user: AuthUser; accessToken: string }

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }).then((r) => r.data.user),
  register: (payload: { name: string; email: string; password: string; role: Role; inviteCode?: string }) =>
    api.post<AuthResponse>("/auth/register", payload).then((r) => r.data.user),
  me: () => api.get<AuthUser>("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").catch(() => undefined),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) => api.post("/auth/reset-password", { token, password }),
}

export type GovFilters = { status?: IdeaStatus; search?: string }

export const ideasApi = {
  listMine: () => api.get<IdeaPage>("/ideas", { params: { page: 1, limit: 100 } }).then((r) => r.data.items),
  listAll: (filters: GovFilters = {}) =>
    api
      .get<IdeaPage>("/ideas", {
        params: { page: 1, limit: 100, status: filters.status, search: filters.search || undefined },
      })
      .then((r) => r.data.items),
  get: (id: number) => api.get<Idea>(`/ideas/${id}`).then((r) => r.data),
  create: (payload: { title: string; description: string; lat: number; lng: number; photoUrl: string; kind?: IdeaKind }) =>
    api.post<Idea>("/ideas", payload).then((r) => r.data),
  updateStatus: (id: number, status: IdeaStatus, comment?: string) =>
    api.patch<Idea>(`/ideas/${id}/status`, { status, comment }).then((r) => r.data),
  assign: (id: number, assigneeId: number) =>
    api.patch<Idea>(`/ideas/${id}/assignee`, { assigneeId }).then((r) => r.data),
  feedback: (id: number, payload: { rating: number; comment?: string; afterPhotoUrl?: string }) =>
    api.post<Idea>(`/ideas/${id}/feedback`, payload).then((r) => r.data),
  digest: () => api.get<Digest>("/ideas/digest").then((r) => r.data),
}

export const usersApi = {
  govOfficials: () => api.get<GovOfficial[]>("/users", { params: { role: "gov_official" } }).then((r) => r.data),
}

export const districtsApi = {
  ranking: () => api.get<DistrictRankingEntry[]>("/districts/ranking").then((r) => r.data),
  detail: (district: string) =>
    api.get<DistrictDetail>(`/districts/${encodeURIComponent(district)}`).then((r) => r.data),
}

export const aiApi = {
  parseIdea: (message: string) => api.post<ParsedIdea>("/ai/parse-idea", { message }).then((r) => r.data),
}

export const geoApi = {
  /** Backend отдаёт район голым текстом, не JSON. */
  reverse: (lat: number, lng: number) =>
    api.get<string>("/geocoding/reverse", { params: { lat, lng }, responseType: "text" }).then((r) => String(r.data)),
  search: (q: string) => api.get<AddressResult[]>("/geocoding/search", { params: { q } }).then((r) => r.data),
}

/** Уменьшает фото до 1600 px по длинной стороне (JPEG), чтобы загрузка была быстрой и проходила через прокси. */
async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    return blob ?? file
  } catch {
    return file
  }
}

export async function uploadPhoto(file: File): Promise<string> {
  const blob = await shrinkPhoto(file)
  const form = new FormData()
  form.append("file", blob, "photo.jpg")
  const { data } = await api.post<{ url: string }>("/uploads", form)
  return data.url
}
