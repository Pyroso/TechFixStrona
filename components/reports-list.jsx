"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReportDetailDialog } from "@/components/report-detail-dialog"
import { Search, RefreshCw, Trash2, AlertTriangle } from "lucide-react"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { ReportSkeleton } from "@/components/report-skeleton"

export function ReportsList() {
  const { isTechnician, isWorker } = useAuth()
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const fetchReports = useCallback(async () => {
    try {
      setIsRefreshing(true)
      setError(null)
      const response = await fetch("/api/reports")
      if (!response.ok) throw new Error("Failed to fetch reports")
      const data = await response.json()
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      setError("Failed to load reports. Please try again.")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useAutoRefresh(fetchReports, 6000)

  useEffect(() => {
    let filtered = [...reports]

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((r) => r.priority === priorityFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } else if (sortBy === "status") {
      const statusOrder = { New: 0, "In Progress": 1, Resolved: 2 }
      filtered.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
    } else if (sortBy === "priority") {
      const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 }
      filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    }

    setFilteredReports(filtered)
  }, [reports, searchTerm, statusFilter, priorityFilter, sortBy])

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
        return "bg-blue-600/70 text-blue-100"
      case "Medium":
        return "bg-yellow-600/70 text-yellow-100"
      case "High":
        return "bg-orange-600/70 text-orange-100"
      case "Critical":
        return "bg-red-600/70 text-red-100"
      default:
        return "bg-gray-600/70 text-gray-100"
    }
  }

  const handleClaimReport = async (reportId, technicianName) => {
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

  const handleResolveReport = async (reportId) => {
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

  const handleDeleteReport = async (reportId) => {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">All Reports</h2>
          <p className="text-muted-foreground">View and manage all error reports across the factory</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchReports()}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border/50"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-input border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="bg-input border-border/50">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
          <SelectTrigger className="bg-input border-border/50">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Most Recent</SelectItem>
            <SelectItem value="status">By Status</SelectItem>
            <SelectItem value="priority">By Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReportSkeleton key={i} />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <Card className="border-border/50 bg-card">
          <CardContent className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">No reports found matching your criteria</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <Card
              key={report.id}
              className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5 border-border/50 bg-card hover:bg-card/80"
              onClick={() => setSelectedReport(report)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base line-clamp-2">{report.title}</CardTitle>
                    <CardDescription className="line-clamp-1">{report.location}</CardDescription>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Badge className={getPriorityColor(report.priority)}>
                      <AlertTriangle className="h-3 w-3 mr-0.5" />
                      {report.priority}
                    </Badge>
                    <Badge className={`${getStatusColor(report.status)}`}>{report.status}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reported:</span>
                    <span className="font-medium">{new Date(report.timestamp).toLocaleDateString()}</span>
                  </div>
                  {report.assignedTechnician && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned:</span>
                      <span className="font-medium">{report.assignedTechnician}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 flex-wrap">
                  {report.status === "New" && isTechnician && (
                    <Button
                      size="sm"
                      variant="default"
                      className="text-xs h-7 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedReport(report)
                      }}
                    >
                      Claim
                    </Button>
                  )}
                  {report.status === "In Progress" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 bg-transparent border-border/50 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedReport(report)
                      }}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {report.status === "Resolved" && isTechnician && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Delete this resolved report?")) {
                          handleDeleteReport(report.id)
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
