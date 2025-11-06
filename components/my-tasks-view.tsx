"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { ErrorReport } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReportDetailDialog } from "@/components/report-detail-dialog"
import { Clock, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from "lucide-react"

type SortField = "title" | "location" | "status" | "timestamp" | "assignedTechnician"
type SortOrder = "asc" | "desc"

export function MyTasksView() {
  const { isTechnician, user } = useAuth()
  const [reports, setReports] = useState<ErrorReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true)
        // Get only "In Progress" reports by default
        const response = await fetch("/api/reports?status=In%20Progress")
        const data: ErrorReport[] = await response.json()
        setReports(data)
      } catch (error) {
        console.error("Failed to fetch reports:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [])

  // Sort reports
  const sortedReports = [...reports].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "timestamp") {
      aValue = new Date(a.timestamp).getTime()
      bValue = new Date(b.timestamp).getTime()
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortOrder === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "New":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "Resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return null
    }
  }

  const handleResolveReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved" }),
      })

      if (response.ok) {
        const updatedReport = await response.json()
        setReports(reports.map((r) => (r.id === reportId ? updatedReport : r)))
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport)
        }
      }
    } catch (error) {
      console.error("Failed to resolve report:", error)
    }
  }

  const handleClaimReport = async (reportId: string, technicianName: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "In Progress",
          assignedTechnician: technicianName,
        }),
      })

      if (response.ok) {
        const updatedReport = await response.json()
        setReports(reports.map((r) => (r.id === reportId ? updatedReport : r)))
        if (selectedReport?.id === reportId) {
          setSelectedReport(updatedReport)
        }
      }
    } catch (error) {
      console.error("Failed to claim report:", error)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setReports(reports.filter((r) => r.id !== reportId))
        setSelectedReport(null)
      }
    } catch (error) {
      console.error("Failed to delete report:", error)
    }
  }

  if (!isTechnician) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium">This page is only available to technicians.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Workers can view and create reports from the dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">My Tasks</h2>
        <p className="text-muted-foreground">Manage your assigned error reports and track progress</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.filter((r) => r.status === "In Progress").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.filter((r) => r.assignedTechnician).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reports.filter((r) => !r.assignedTechnician).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tasks</CardTitle>
          <CardDescription>Click on a task to view details and manage status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          ) : sortedReports.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <p className="text-muted-foreground">No in-progress tasks at the moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center">
                        Title
                        <SortIcon field="title" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted"
                      onClick={() => handleSort("location")}
                    >
                      <div className="flex items-center">
                        Location
                        <SortIcon field="location" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted"
                      onClick={() => handleSort("assignedTechnician")}
                    >
                      <div className="flex items-center">
                        Assigned To
                        <SortIcon field="assignedTechnician" />
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-muted"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center">
                        Reported
                        <SortIcon field="timestamp" />
                      </div>
                    </TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedReport(report)}
                    >
                      <TableCell className="font-medium">{report.title}</TableCell>
                      <TableCell>{report.location}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(report.status)}
                          <Badge
                            variant="outline"
                            className={
                              report.status === "New"
                                ? "border-destructive text-destructive"
                                : report.status === "In Progress"
                                  ? "border-orange-600 text-orange-600"
                                  : "border-green-600 text-green-600"
                            }
                          >
                            {report.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{report.assignedTechnician || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(report.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedReport(report)
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      {selectedReport && (
        <ReportDetailDialog
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onClaim={handleClaimReport}
          onResolve={handleResolveReport}
          onDelete={handleDeleteReport}
        />
      )}
    </div>
  )
}
