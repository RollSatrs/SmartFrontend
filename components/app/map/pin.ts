import L from "leaflet"

/** Метка в цвете приложения. Стандартные картинки Leaflet сборщик не подхватывает, поэтому рисуем свои. */
export function pinIcon(color = "#4b7361", size = 1) {
  return L.divIcon({
    className: "",
    iconSize: [34 * size, 44 * size],
    iconAnchor: [17 * size, 42 * size],
    html: `<svg width="${34 * size}" height="${44 * size}" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 1C8 1 1 8 1 16.5 1 28 17 43 17 43s16-15 16-26.5C33 8 26 1 17 1z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="17" cy="16.5" r="6" fill="#fff"/></svg>`,
  })
}

export const SEMEY: [number, number] = [50.4111, 80.2275]

export const TILES = {
  url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "© OpenStreetMap",
}
