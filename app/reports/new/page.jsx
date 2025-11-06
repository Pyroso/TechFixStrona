import { ProtectedLayout } from "@/components/protected-layout"
import { NewReportForm } from "@/components/new-report-form"

export default function NewReportPage() {
  return (
    <ProtectedLayout>
      <NewReportForm />
    </ProtectedLayout>
  )
}
