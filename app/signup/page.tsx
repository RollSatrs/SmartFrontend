import { Suspense } from "react"
import { AuthLayout } from "@/components/app/auth-layout"
import { SignupForm } from "@/components/signup-form"

export default function Page() {
  return (
    <AuthLayout>
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthLayout>
  )
}
