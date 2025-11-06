"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { StatCardSkeleton } from "@/components/stat-card-skeleton"

export function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  })
  const [lastUpdated, setLastUpdated] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/reports/stats")
        const data = await response.json()
        setStats(data)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    const interval = setInterval(fetchStats, 5000)

    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Reports",
      value: stats.total,
      icon: AlertCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "New Issues",
      value: stats.new,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-foreground">Overview</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Real-time • Updated: {lastUpdated || "Just now"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.title} className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                    </CardContent>
                  </Card>
                )
              })}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h3>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Real-time factory monitoring status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-colors hover:bg-muted/80">
                <span className="text-sm font-medium">System Status</span>
                <Badge className="bg-green-600 animate-pulse">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-colors hover:bg-muted/80">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-muted-foreground">{lastUpdated || "Just now"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg transition-colors hover:bg-muted/80">
                <span className="text-sm font-medium">Connected Devices</span>
                <Badge className="bg-primary/20 text-primary">12 Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
