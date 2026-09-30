"use client"

import { useEffect, useState } from "react"

/**
 * Улица и дом по координатам. Backend отдаёт только район, поэтому адрес определяем через Nominatim
 * (OpenStreetMap). Правила сервиса: не чаще одного запроса в секунду, поэтому запросы идут по очереди,
 * а результат запоминается в браузере.
 */
const STORE_KEY = "smartcity.addressCache"
const memory = new Map<string, string>()
let queue: Promise<unknown> = Promise.resolve()

const keyOf = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`

function loadCache() {
  if (memory.size || typeof localStorage === "undefined") return
  try {
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}") as Record<string, string>
    for (const [key, value] of Object.entries(stored)) memory.set(key, value)
  } catch {
    // повреждённый кэш игнорируем
  }
}

function saveCache() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(Object.fromEntries(memory)))
  } catch {
    // хранилище недоступно (приватный режим): работаем без кэша
  }
}

export function clearAddressCache() {
  memory.clear()
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    // ничего
  }
}

async function fetchStreet(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`
  const response = await fetch(url, { headers: { Accept: "application/json" } })
  if (!response.ok) throw new Error("geocoding failed")
  const data = (await response.json()) as { address?: { road?: string; pedestrian?: string; house_number?: string } }
  const road = data.address?.road ?? data.address?.pedestrian ?? ""
  const house = data.address?.house_number
  return road ? (house ? `${road}, ${house}` : road) : ""
}

export function resolveStreet(lat: number, lng: number): Promise<string | null> {
  loadCache()
  const key = keyOf(lat, lng)
  const cached = memory.get(key)
  if (cached !== undefined) return Promise.resolve(cached || null)

  const job = queue.then(async () => {
    const again = memory.get(key)
    if (again !== undefined) return again || null
    try {
      const street = await fetchStreet(lat, lng)
      memory.set(key, street)
      saveCache()
      return street || null
    } catch {
      return null
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 1100))
    }
  })
  queue = job.catch(() => undefined)
  return job
}

/** Улица и дом для координат; пока определяется или недоступно, возвращает `null`. */
export function useStreet(lat: number, lng: number) {
  const [street, setStreet] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    void resolveStreet(lat, lng).then((value) => {
      if (!cancelled) setStreet(value)
    })
    return () => {
      cancelled = true
    }
  }, [lat, lng])
  return street
}
