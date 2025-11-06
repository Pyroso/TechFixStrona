"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import type { ErrorReport } from "@/lib/types"

export function MapDashboard() {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const [reports, setReports] = useState<ErrorReport[]>([])
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      setIsRefreshing(true)
      const response = await fetch("/api/reports")
      const data: ErrorReport[] = await response.json()
      setReports(data)

      // Clear existing markers
      markersRef.current.forEach((marker) => {
        leafletMap.current?.removeLayer(marker)
      })
      markersRef.current = []

      // Add markers for each report
      data.forEach((report) => {
        const statusColors = {
          New: { color: "#dc2626", icon: "❌" },
          "In Progress": { color: "#ea580c", icon: "⏱️" },
          Resolved: { color: "#16a34a", icon: "✓" },
        }

        const statusInfo = statusColors[report.status as keyof typeof statusColors]

        const marker = L.circleMarker([report.latitude, report.longitude], {
          radius: 10,
          fillColor: statusInfo.color,
          color: "#000",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(leafletMap.current!)
          .bindPopup(
            `<div class="p-2">
              <p class="font-bold">${report.title}</p>
              <p class="text-sm">${report.location}</p>
            </div>`,
          )
          .on("click", () => setSelectedReport(report))

        markersRef.current.push(marker)
      })
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setIsRefreshing(false)
      setLoading(false)
    }
  }

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current) return

    const map = L.map(mapRef.current).setView([40.7128, -74.006], 15)

    // Add tile layer (using OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)

    leafletMap.current = map

    // Cleanup on unmount
    return () => {
      map.remove()
    }
  }, [])

  useAutoRefresh(fetchReports, 5000)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Factory Map</h2>
          <p className="text-muted-foreground">Real-time visualization of all reported issues across the facility</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchReports()}
          disabled={isRefreshing}
          className="shrink-0 transition-all duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Error Locations</CardTitle>
              <CardDescription>
                Color-coded by status • {loading ? "Loading..." : `${reports.length} active`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div
                ref={mapRef}
                className="w-full h-96 lg:h-[500px] rounded-b-lg relative"
                style={{ borderRadius: "0 0 0.5rem 0.5rem" }}
              >
                {loading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-b-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      Loading map...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend and Selected Report */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-destructive" />
                <span className="text-sm">New</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: "#ea580c" }} />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
                <div className="w-6 h-6 rounded-full bg-green-600" />
                <span className="text-sm">Resolved</span>
              </div>
            </CardContent>
          </Card>

          {selectedReport && (
            <Card className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <CardHeader>
                <CardTitle className="text-base">{selectedReport.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{selectedReport.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-1">{selectedReport.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedReport.description}</p>
                </div>
                {selectedReport.assignedTechnician && (
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-medium">{selectedReport.assignedTechnician}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Reported</p>
                  <p className="text-sm">{new Date(selectedReport.timestamp).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
