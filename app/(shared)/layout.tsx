import { Shell } from "@/components/app/shell"

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return <Shell allow={["resident", "gov_official", "admin"]}>{children}</Shell>
}
