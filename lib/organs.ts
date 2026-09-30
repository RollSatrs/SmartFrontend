/**
 * Орган или отдел, которому адресовано обращение. Определяется по категории, которую выбрал ИИ.
 *
 * Названия, адреса и телефоны взяты из открытых источников, список и даты в `ORGANS_SOURCES.md`.
 * Справочник отвечает за город Семей: для других городов и районов области ответственным будет их акимат.
 * Структура органов меняется, поэтому перед защитой её нужно сверить с акиматом.
 */
export type ResponsibleOrgan = {
  name: string
  /** Короткое название для фильтров. */
  short: string
  /** Адрес и телефон, если найдены в открытых источниках. */
  contacts?: string
  /** Дополнительный орган, к которому тоже может относиться обращение. */
  also?: string
}

const cityHousing: ResponsibleOrgan = {
  name: "Отдел жилищно-коммунального хозяйства города Семей",
  short: "ЖКХ города",
  contacts: "Мәңгілік ел, 45 · тел. 33-90-60",
}
const cityTransportRoads: ResponsibleOrgan = {
  name: "Отдел пассажирского транспорта и автомобильных дорог города Семей",
  short: "Транспорт и дороги",
  contacts: "ул. Уранхаева, 53 · тел. 35-45-15",
}
const cityEducation: ResponsibleOrgan = {
  name: "Отдел образования города Семей",
  short: "Образование",
  contacts: "ул. Кабанбай батыра, 30 · тел. 52-48-27",
}
const police: ResponsibleOrgan = {
  name: "Департамент полиции области Абай МВД РК",
  short: "Полиция",
  contacts: "ул. Б. Момышулы, 17",
  also: "Департамент по чрезвычайным ситуациям области Абай (ул. Козбагарова, 38)",
}
const ecology: ResponsibleOrgan = {
  name: "Департамент экологии по области Абай",
  short: "Экология",
  contacts: "ул. Б. Момышулы, 19А",
  also: "Управление природных ресурсов и регулирования природопользования области Абай",
}
const healthcare: ResponsibleOrgan = { name: "Управление здравоохранения области Абай", short: "Здравоохранение" }
const akimat: ResponsibleOrgan = {
  name: "Аппарат акима области Абай",
  short: "Аппарат акима",
  contacts: "ул. Қайым Мұхамедханов, 8",
}

const BY_SLUG: Record<string, ResponsibleOrgan> = {
  roads: cityTransportRoads,
  transport: cityTransportRoads,
  utilities: cityHousing,
  // Благоустройство: предположительно курирует отдел ЖКХ, уточнить в акимате.
  improvement: cityHousing,
  education: cityEducation,
  safety: police,
  ecology,
  healthcare,
  other: akimat,
}

export const organForSlug = (slug: string | null | undefined): ResponsibleOrgan | null =>
  slug ? (BY_SLUG[slug] ?? null) : null

/** Название вместе с адресом, телефоном и дополнительным органом. */
export const organDetails = (organ: ResponsibleOrgan) => [organ.name, organ.contacts, organ.also ? `Также: ${organ.also}` : null].filter(Boolean) as string[]
