import { IconBulb, IconMap2, IconShieldCheck } from "@tabler/icons-react"
import { BrandName } from "@/components/app/brand"

const POINTS = [
  { icon: IconBulb, text: "Опишите проблему: фото, точка на карте и пара слов" },
  { icon: IconMap2, text: "ИИ определит категорию и район, власть увидит обращение на карте" },
  { icon: IconShieldCheck, text: "Следите за статусом и оцените результат" },
]

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <BrandName className="[&_span]:!text-primary-foreground [&>span:first-child]:bg-white/15" />
        <div className="max-w-lg space-y-8">
          <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight text-balance">
            Идеи для региона
          </h1>
          <p className="text-lg/7 text-primary-foreground/85 text-pretty">
            Единый канал между жителями области Абай и органами власти.
          </p>
          <ul className="space-y-4">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[15px]/6">
                <Icon className="mt-0.5 size-5 shrink-0 opacity-90" aria-hidden />
                <span className="text-primary-foreground/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-primary-foreground/70 text-sm">Семей и область Абай</p>
      </aside>
      <main className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <BrandName className="mb-10 lg:hidden" />
          {children}
        </div>
      </main>
    </div>
  )
}
