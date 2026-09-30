"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { pinIcon, TILES } from "@/components/app/map/pin"

/** Место обращения: метка на подложке OpenStreetMap, карту можно двигать и масштабировать. */
export default function MapView({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current, { center: [lat, lng], zoom: 16, scrollWheelZoom: false })
    L.tileLayer(TILES.url, { maxZoom: 19, attribution: TILES.attribution }).addTo(map)
    L.marker([lat, lng], { icon: pinIcon() }).addTo(map)
    return () => {
      map.remove()
    }
  }, [lat, lng])
  return <div ref={ref} className="h-64 w-full rounded-2xl border" role="application" aria-label="Карта места обращения" />
}
