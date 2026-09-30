import { Shell } from "@/components/app/shell"

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return <Shell allow={["resident"]}>{children}</Shell>
}
