import type { Metadata, Viewport } from "next"
import { Onest } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Идеи для региона · Smart City Абай",
  description:
    "Единый канал между жителями области Абай и органами власти: сообщите о проблеме за минуту и следите за её решением.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#131a17" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${onest.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
