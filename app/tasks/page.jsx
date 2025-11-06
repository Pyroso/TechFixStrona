import { ProtectedLayout } from "@/components/protected-layout"
import { MyTasksView } from "@/components/my-tasks-view"

export default function TasksPage() {
  return (
    <ProtectedLayout>
      <MyTasksView />
    </ProtectedLayout>
  )
}
