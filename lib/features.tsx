"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"

type Features = { ideaKind: boolean }

const FeaturesContext = createContext<Features>({ ideaKind: false })

/**
 * Возможности сервера из `GET /health`. Новые функции (например, тип обращения «проблема / идея») включаются сами,
 * как только сервер их поддерживает, поэтому сайт работает с любой версией сервера.
 */
export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [ideaKind, setIdeaKind] = useState(false)

  useEffect(() => {
    api
      .get<{ features?: string[] }>("/health")
      .then((r) => setIdeaKind(r.data.features?.includes("idea-kind") ?? false))
      .catch(() => setIdeaKind(false))
  }, [])

  const value = useMemo(() => ({ ideaKind }), [ideaKind])
  return <FeaturesContext.Provider value={value}>{children}</FeaturesContext.Provider>
}

export const useFeatures = () => useContext(FeaturesContext)
