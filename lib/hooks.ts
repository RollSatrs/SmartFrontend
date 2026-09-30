"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { errorText } from "@/lib/api"

/** Загрузка данных с состояниями загрузки и ошибки. `reload` перезапрашивает без сброса экрана. */
export function useData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    setError("")
    try {
      setData(await loaderRef.current())
    } catch (e) {
      setError(errorText(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, setData, error, loading, reload: () => run(true), retry: () => run(false) }
}

export function useDebounced<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
