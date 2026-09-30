"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import {
  IconArrowLeft,
  IconCamera,
  IconCheck,
  IconCircle,
  IconCurrentLocation,
  IconMapPin,
  IconPhoto,
  IconPhotoPlus,
  IconSearch,
  IconSignRight,
  IconSparkles,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { resolveStreet } from "@/lib/address"
import { errorText } from "@/lib/api"
import { useFeatures } from "@/lib/features"
import { useDebounced } from "@/lib/hooks"
import { organDetails, organForSlug } from "@/lib/organs"
import { aiApi, geoApi, ideasApi, uploadPhoto } from "@/lib/services"
import { categoryName, KIND_LABEL, type AddressResult, type IdeaKind } from "@/lib/types"
import { cn } from "@/lib/utils"

const MapPicker = dynamic(() => import("@/components/app/map/picker"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
})

type Point = { lat: number; lng: number }

function Section({ step, title, hint, children }: { step: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card space-y-4 rounded-2xl border p-5 sm:p-6">
      <header className="flex items-start gap-3">
        <span className="bg-primary text-primary-foreground tabular flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {step}
        </span>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {hint && <p className="text-muted-foreground text-sm">{hint}</p>}
        </div>
      </header>
      {children}
    </section>
  )
}

export function NewIdeaForm() {
  const router = useRouter()
  const aiRef = useRef<HTMLTextAreaElement>(null)
  const askAi = useSearchParams().get("ai") === "1"
  const { ideaKind } = useFeatures()
  const [kind, setKind] = useState<IdeaKind>("problem")

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [point, setPoint] = useState<Point | null>(null)
  const [district, setDistrict] = useState("")
  const [street, setStreet] = useState("")
  const [resolving, setResolving] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<AddressResult[]>([])
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  // ИИ-помощник
  const [aiText, setAiText] = useState("")
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState("")
  const [aiCategory, setAiCategory] = useState<string | null>(null)

  useEffect(() => {
    if (askAi) aiRef.current?.focus()
  }, [askAi])

  useEffect(() => {
    if (!file) return setPreview(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Поиск улицы: не чаще раза в секунду, как требует ограничение геокодера на сервере.
  const debounced = useDebounced(query, 700)
  useEffect(() => {
    if (debounced.trim().length < 3) return setResults([])
    let cancelled = false
    geoApi
      .search(debounced.trim())
      .then((r) => !cancelled && setResults(r.slice(0, 5)))
      .catch(() => !cancelled && setResults([]))
    return () => {
      cancelled = true
    }
  }, [debounced])

  async function choose(next: Point) {
    setPoint(next)
    setResolving(true)
    setDistrict("")
    setStreet("")
    const [d, s] = await Promise.allSettled([geoApi.reverse(next.lat, next.lng), resolveStreet(next.lat, next.lng)])
    setDistrict(d.status === "fulfilled" ? d.value : "")
    setStreet(s.status === "fulfilled" ? (s.value ?? "") : "")
    setResolving(false)
  }

  function useMyLocation() {
    setLocationError("")
    if (!navigator.geolocation) return setLocationError("Браузер не поддерживает геолокацию. Отметьте точку на карте.")
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        void choose({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setLocating(false)
        setLocationError("Нет доступа к геолокации. Разрешите его в настройках браузера или отметьте точку на карте.")
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  async function runAi() {
    setAiError("")
    setAiBusy(true)
    try {
      const parsed = await aiApi.parseIdea(aiText.trim())
      setTitle(parsed.title)
      setDescription(parsed.description)
      setAiCategory(parsed.categorySlug)
      if (parsed.kind) setKind(parsed.kind)
    } catch (e) {
      setAiError(errorText(e))
    } finally {
      setAiBusy(false)
    }
  }

  const titleOk = title.trim().length >= 3
  const descOk = description.trim().length >= 15
  const checks = [
    { label: "Название от 3 символов", ok: titleOk },
    { label: "Описание от 15 символов", ok: descOk },
    { label: "Фото", ok: !!file },
    { label: "Точка на карте", ok: !!point },
  ]
  const canSubmit = checks.every((c) => c.ok) && !submitting

  async function submit() {
    if (!file || !point) return
    setSubmitting(true)
    setError("")
    try {
      const photoUrl = await uploadPhoto(file)
      const idea = await ideasApi.create({
        title: title.trim(),
        description: description.trim(),
        lat: point.lat,
        lng: point.lng,
        photoUrl,
        // Тип уходит на сервер только если он его поддерживает: старый сервер отклонил бы лишнее поле.
        kind: ideaKind ? kind : undefined,
      })
      toast.success("Идея отправлена")
      router.replace(`/ideas/${idea.id}`)
    } catch (e) {
      setError(errorText(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href="/resident" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm">
        <IconArrowLeft className="size-4" aria-hidden />
        Назад
      </Link>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Новая идея</h1>
        <p className="text-muted-foreground text-sm">Опишите проблему конкретно, так её быстрее направят ответственному органу.</p>
      </div>

      <section className="bg-sage-soft space-y-3 rounded-2xl p-5">
        <h2 className="text-sage-ink flex items-center gap-2 font-semibold">
          <IconSparkles className="size-5" aria-hidden />
          Описать с помощью ИИ
        </h2>
        <p className="text-muted-foreground text-sm">Напишите своими словами, а мы подготовим название и описание.</p>
        <Textarea
          ref={aiRef}
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Например: на Абая у школы большая яма, машины объезжают по тротуару"
          aria-label="Сообщение для ИИ"
          className="bg-card"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={runAi} disabled={aiText.trim().length < 10 || aiBusy}>
            {aiBusy ? <Spinner className="size-4" /> : <IconSparkles className="size-4" />}
            Заполнить поля
          </Button>
          {aiCategory && !aiBusy && (
            <span className="text-sage-ink text-sm">
              Предполагаемая категория: <strong>{categoryName(aiCategory)}</strong>
            </span>
          )}
        </div>
        {aiCategory && !aiBusy && organForSlug(aiCategory) && (
          <div className="bg-card text-sm rounded-xl p-3">
            <p className="text-muted-foreground text-xs">Кому адресуем</p>
            {organDetails(organForSlug(aiCategory)!).map((line, i) => (
              <p key={line} className={i === 0 ? "font-medium" : "text-muted-foreground text-xs"}>
                {line}
              </p>
            ))}
          </div>
        )}
        {aiError && (
          <p role="alert" className="text-destructive text-sm">
            {aiError}
          </p>
        )}
        <p className="text-muted-foreground text-xs">Не указывайте ИИН, номера документов и другие персональные данные.</p>
      </section>

      <Section step={1} title="Опишите идею">
        {ideaKind && (
          <div role="radiogroup" aria-label="Тип обращения" className="bg-muted grid grid-cols-2 gap-1 rounded-xl p-1">
            {(Object.keys(KIND_LABEL) as IdeaKind[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={kind === key}
                onClick={() => setKind(key)}
                className={cn(
                  "h-9 rounded-lg text-sm font-medium transition-colors",
                  kind === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {KIND_LABEL[key]}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Короткое название
          </label>
          <Input id="title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} className="h-11" />
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Проблема и предлагаемое решение
          </label>
          <Textarea id="description" value={description} maxLength={1500} onChange={(e) => setDescription(e.target.value)} rows={5} />
          <p className="text-muted-foreground tabular text-right text-xs">{description.length}/1500</p>
        </div>
      </Section>

      <Section step={2} title="Добавьте фото" hint="Фото помогает быстрее оценить ситуацию">
        {preview ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Выбранное фото" className="aspect-[16/9] w-full rounded-xl object-cover" />
            <Button type="button" size="icon" variant="secondary" className="absolute top-3 right-3" onClick={() => setFile(null)} aria-label="Убрать фото">
              <IconX className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="text-muted-foreground flex aspect-[16/6] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm">
            <IconPhotoPlus className="text-brand size-8" aria-hidden />
            Прикрепите один понятный снимок
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <label className="bg-secondary text-secondary-foreground hover:bg-secondary/80 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors">
            <IconCamera className="size-5" aria-hidden />
            Камера
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <label className="bg-card hover:bg-muted flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors">
            <IconPhoto className="size-5" aria-hidden />
            Из галереи
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      </Section>

      <Section step={3} title="Отметьте место на карте" hint="Нажмите на карту или перетащите метку">
        <div className="relative">
          <IconSearch className="text-muted-foreground pointer-events-none absolute top-3.5 left-3 size-4" aria-hidden />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти улицу в Семее"
            aria-label="Поиск улицы"
            autoComplete="off"
            className="h-11 pl-9"
          />
          {results.length > 0 && (
            <ul className="bg-popover absolute inset-x-0 top-12 z-20 overflow-hidden rounded-xl border shadow-lg">
              {results.map((r) => (
                <li key={r.displayName}>
                  <button
                    type="button"
                    className="hover:bg-muted w-full px-3 py-2.5 text-left text-sm"
                    onClick={() => {
                      setResults([])
                      setQuery("")
                      void choose({ lat: r.lat, lng: r.lng })
                    }}
                  >
                    {r.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="button" variant="secondary" className="w-full" onClick={useMyLocation} disabled={locating}>
          {locating ? <Spinner className="size-4" /> : <IconCurrentLocation className="size-5" />}
          Я здесь: указать мою точку
        </Button>
        {locationError && (
          <p role="alert" className="text-destructive text-sm">
            {locationError}
          </p>
        )}

        <MapPicker value={point} onChange={(p) => void choose(p)} />

        <div aria-live="polite" className="min-h-10 text-sm">
          {resolving ? (
            <span className="text-muted-foreground inline-flex items-center gap-2">
              <Spinner className="size-4" />
              Определяем адрес
            </span>
          ) : point ? (
            <div className="space-y-1">
              {street && (
                <p className="inline-flex items-center gap-2 font-medium">
                  <IconSignRight className="text-brand size-4" aria-hidden />
                  {street}
                </p>
              )}
              {district && (
                <p className="text-brand flex items-center gap-2 font-medium">
                  <IconMapPin className="size-4" aria-hidden />
                  {district}
                </p>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">Точка пока не выбрана</span>
          )}
        </div>
      </Section>

      {error && (
        <p role="alert" className="bg-danger-soft text-destructive rounded-lg px-4 py-3 text-sm">
          {error}
        </p>
      )}

      <div className="space-y-3 pb-2">
        <Button size="lg" className="h-12 w-full text-base" disabled={!canSubmit} onClick={submit}>
          {submitting && <Spinner className="size-5" />}
          {submitting ? "Отправляем" : "Отправить идею"}
        </Button>
        {!canSubmit && !submitting && (
          <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
            {checks.map((c) => (
              <li key={c.label} className={cn("inline-flex items-center gap-1.5", c.ok ? "text-primary" : "text-muted-foreground")}>
                {c.ok ? <IconCheck className="size-3.5" aria-hidden /> : <IconCircle className="size-3.5" aria-hidden />}
                {c.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
