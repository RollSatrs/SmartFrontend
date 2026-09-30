import { Shell } from "@/components/app/shell"

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return <Shell allow={["gov_official", "admin"]}>{children}</Shell>
}
