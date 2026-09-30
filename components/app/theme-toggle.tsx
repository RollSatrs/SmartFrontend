"use client"

import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // Тема известна только в браузере: до гидратации показываем нейтральное состояние без предупреждений React.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const dark = mounted && resolvedTheme === "dark"
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
    </Button>
  )
}
