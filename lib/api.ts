import axios, { AxiosError } from "axios"
import { env } from "@/lib/env"

export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

const AUTH_PAGES = ["/login", "/signup", "/forgot-password", "/reset-password"]

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ""
    // 401 на запрос внутри приложения: сессия закончилась, возвращаем на вход.
    // Проверку сессии (`/auth/me`) и сами страницы входа не трогаем.
    if (error.response?.status === 401 && typeof window !== "undefined" && !url.startsWith("/auth/")) {
      if (!AUTH_PAGES.some((page) => window.location.pathname.startsWith(page))) {
        window.location.href = "/login?expired=1"
      }
    }
    return Promise.reject(error)
  },
)

/** Человеческое сообщение об ошибке: ответ сервера или понятный текст про сеть. */
export function errorText(error: unknown, fallback = "Что-то пошло не так. Попробуйте ещё раз."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Нет связи с сервером. Проверьте интернет и попробуйте снова."
    const message = (error.response.data as { message?: string | string[] } | undefined)?.message
    if (Array.isArray(message)) return message.join(". ")
    if (message) return message
    if (error.response.status === 429) return "Слишком много попыток. Подождите минуту."
    if (error.response.status >= 500) return "Сервер временно недоступен. Попробуйте позже."
  }
  return fallback
}

/**
 * Backend отдаёт адреса фото вида `http://<сервер>/uploads/<файл>`. Страница по HTTPS не покажет такие
 * картинки, поэтому переписываем адрес на путь через прокси сайта.
 */
export function photoSrc(url: string | null | undefined): string {
  if (!url) return ""
  const match = url.match(/\/uploads\/([^/?#]+)/)
  return match ? `${env.NEXT_PUBLIC_API_URL}/uploads/${match[1]}` : url
}
