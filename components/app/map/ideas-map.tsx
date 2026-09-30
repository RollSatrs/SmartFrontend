"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { pinIcon, SEMEY, TILES } from "@/components/app/map/pin"
import { STATUS_STYLE } from "@/components/app/status-badge"
import { isOverdue } from "@/lib/format"
import type { Idea } from "@/lib/types"

export type MapHandle = { fitAll: () => void; fitCity: () => void }

/** Карта всех обращений: цвет метки по статусу, просроченные красным. Тап по метке выбирает обращение. */
export default function IdeasMap({
  ideas,
  selectedId,
  onSelect,
  onReady,
}: {
  ideas: Idea[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  onReady?: (handle: MapHandle) => void
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    if (!ref.current || mapRef.current) return
    const map = L.map(ref.current, { center: SEMEY, zoom: 12 })
    L.tileLayer(TILES.url, { maxZoom: 19, attribution: TILES.attribution }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    map.on("click", () => onSelectRef.current(null))
    mapRef.current = map
    onReady?.({
      fitCity: () => map.setView(SEMEY, 12),
      fitAll: () => {
        const points = layerRef.current?.getLayers().map((l) => (l as L.Marker).getLatLng()) ?? []
        if (points.length) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 15 })
      },
    })
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    layer.clearLayers()
    for (const idea of ideas) {
      const color = isOverdue(idea) ? "#bc5a45" : STATUS_STYLE[idea.status].dot
      const selected = idea.id === selectedId
      L.marker([idea.lat, idea.lng], {
        icon: pinIcon(color, selected ? 1.25 : 1),
        title: idea.title,
        zIndexOffset: selected ? 1000 : 0,
      })
        .on("click", (event) => {
          L.DomEvent.stopPropagation(event)
          onSelectRef.current(idea.id)
        })
        .addTo(layer)
    }
  }, [ideas, selectedId])

  return <div ref={ref} className="size-full" role="application" aria-label="Карта обращений" />
}
