import { ProtectedLayout } from "@/components/protected-layout"
import { Dashboard } from "@/components/dashboard"

export default function Home() {
  return (
    <ProtectedLayout>
      <Dashboard />
    </ProtectedLayout>
  )
}
