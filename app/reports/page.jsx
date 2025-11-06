import { ProtectedLayout } from "@/components/protected-layout"
import { ReportsList } from "@/components/reports-list"

export default function ReportsPage() {
  return (
    <ProtectedLayout>
      <ReportsList />
    </ProtectedLayout>
  )
}
