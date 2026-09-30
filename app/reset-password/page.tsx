import { Suspense } from "react"
import { AuthLayout } from "@/components/app/auth-layout"
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function Page() {
  return (
    <AuthLayout>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
