"use client"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/lib/auth"
import { FeaturesProvider } from "@/lib/features"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <FeaturesProvider>
        <AuthProvider>{children}</AuthProvider>
      </FeaturesProvider>
    </ThemeProvider>
  )
}
