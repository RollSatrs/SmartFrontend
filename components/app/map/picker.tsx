"use client"

import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useRef } from "react"
import { pinIcon, SEMEY, TILES } from "@/components/app/map/pin"

export type Point = { lat: number; lng: number }

/** Карта выбора точки: клик ставит метку, метку можно перетащить. Внешний `value` двигает метку и карту. */
export default function MapPicker({ value, onChange }: { value: Point | null; onChange: (point: Point) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, {
      center: value ? [value.lat, value.lng] : SEMEY,
      zoom: value ? 16 : 13,
    })
    L.tileLayer(TILES.url, { maxZoom: 19, attribution: TILES.attribution }).addTo(map)

    const place = (latlng: L.LatLng) => {
      if (markerRef.current) {
        markerRef.current.setLatLng(latlng)
        return
      }
      const marker = L.marker(latlng, { icon: pinIcon(), draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const p = marker.getLatLng()
        onChangeRef.current({ lat: p.lat, lng: p.lng })
      })
      markerRef.current = marker
    }
    if (value) place(L.latLng(value.lat, value.lng))
    map.on("click", (event: L.LeafletMouseEvent) => {
      place(event.latlng)
      onChangeRef.current({ lat: event.latlng.lat, lng: event.latlng.lng })
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // Карта создаётся один раз, дальнейшие изменения value обрабатывает эффект ниже.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !value) return
    const target = L.latLng(value.lat, value.lng)
    if (markerRef.current) {
      markerRef.current.setLatLng(target)
    } else {
      const marker = L.marker(target, { icon: pinIcon(), draggable: true }).addTo(map)
      marker.on("dragend", () => {
        const p = marker.getLatLng()
        onChangeRef.current({ lat: p.lat, lng: p.lng })
      })
      markerRef.current = marker
    }
    if (!map.getBounds().contains(target)) map.setView(target, Math.max(map.getZoom(), 16))
  }, [value])

  return <div ref={containerRef} className="h-80 w-full rounded-2xl border" role="application" aria-label="Карта выбора места" />
}
