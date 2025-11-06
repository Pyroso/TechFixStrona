import { ProtectedLayout } from "@/components/protected-layout"
import { MapDashboard } from "@/components/map-dashboard"

export default function MapPage() {
  return (
    <ProtectedLayout>
      <MapDashboard />
    </ProtectedLayout>
  )
}
