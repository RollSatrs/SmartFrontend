import { Suspense } from "react"
import { AuthLayout } from "@/components/app/auth-layout"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  return (
    <AuthLayout>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}
