import { Suspense } from "react"
import { AuthLayout } from "@/components/app/auth-layout"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function Page() {
  return (
    <AuthLayout>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
