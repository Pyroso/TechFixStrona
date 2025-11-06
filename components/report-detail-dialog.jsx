"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { MapPin, Clock, User, Trash2, AlertTriangle } from "lucide-react"

export function ReportDetailDialog({ report, onClose, onClaim, onResolve, onDelete }) {
  const { user, isTechnician, isWorker } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleClaim = async () => {
    if (!isTechnician || !user?.name) return

    setIsSubmitting(true)
    try {
      await onClaim(report.id, user.name)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resolved report?")) return

    setIsDeleting(true)
    try {
      await onDelete(report.id)
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "New":
        return "bg-red-600"
      case "In Progress":
        return "bg-orange-600"
      case "Resolved":
        return "bg-green-600"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Low":
        return "bg-blue-600/80 text-blue-100"
      case "Medium":
        return "bg-yellow-600/80 text-yellow-100"
      case "High":
        return "bg-orange-600/80 text-orange-100"
      case "Critical":
        return "bg-red-600/80 text-red-100"
      default:
        return "bg-gray-600/80 text-gray-100"
    }
  }

  const canClaim = report.status === "New" && isTechnician

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border/50">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{report.title}</DialogTitle>
              <DialogDescription className="mt-2">{report.location}</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(report.priority)}>
                <AlertTriangle className="h-3 w-3 mr-1" />
                {report.priority}
              </Badge>
              <Badge className={`${getStatusColor(report.status)}`}>{report.status}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold">Description</Label>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{report.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Location</Label>
              <div className="mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{report.location}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Coordinates</Label>
              <div className="mt-1 text-sm font-medium font-mono">
                {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Reported Date</Label>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{new Date(report.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {report.assignedTechnician && (
              <div>
                <Label className="text-sm text-muted-foreground">Assigned To</Label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{report.assignedTechnician}</span>
                </div>
              </div>
            )}
          </div>

          {canClaim && (
            <div className="space-y-3 p-4 bg-secondary/20 border border-border/50 rounded-lg">
              <Label className="font-semibold">Claim This Report</Label>
              <div className="text-sm font-medium p-3 bg-input border border-border/50 rounded">
                Will be assigned to: <span className="text-primary">{user?.name}</span>
              </div>
              <Button onClick={handleClaim} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Claiming..." : "Claim Report"}
              </Button>
            </div>
          )}

          {report.status === "In Progress" && (
            <Button
              onClick={() => {
                onResolve(report.id)
                onClose()
              }}
              variant="default"
              className="w-full"
            >
              Mark as Resolved
            </Button>
          )}

          {report.status === "Resolved" && isTechnician && (
            <Button onClick={handleDelete} variant="destructive" className="w-full" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Report"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
