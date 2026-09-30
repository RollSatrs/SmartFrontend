import { Suspense } from "react"
import { NewIdeaForm } from "@/components/app/new-idea-form"

export const metadata = { title: "Новая идея · Smart City Абай" }

export default function NewIdeaPage() {
  return (
    <Suspense>
      <NewIdeaForm />
    </Suspense>
  )
}
