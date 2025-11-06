"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react"
import { LocationMapPicker } from "@/components/location-map-picker"
import Link from "next/link"

const FACTORY_LOCATIONS = [
  { name: "Assembly Line A", lat: 40.7128, lng: -74.006 },
  { name: "Assembly Line B", lat: 40.713, lng: -74.0055 },
  { name: "Warehouse A", lat: 40.7135, lng: -74.0022 },
  { name: "Warehouse B", lat: 40.712, lng: -74.005 },
  { name: "Production Line C", lat: 40.714, lng: -74.008 },
  { name: "Control Room", lat: 40.712, lng: -74.0055 },
  { name: "Maintenance Bay", lat: 40.7115, lng: -74.0065 },
]

const PRIORITIES = [
  { value: "Low", label: "Low", color: "bg-blue-600" },
  { value: "Medium", label: "Medium", color: "bg-yellow-600" },
  { value: "High", label: "High", color: "bg-orange-600" },
  { value: "Critical", label: "Critical", color: "bg-red-600" },
]

export function NewReportForm() {
  const router = useRouter()
  const { isWorker, isTechnician } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
  })
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Please enter a title")
      return false
    }
    if (!formData.description.trim()) {
      setError("Please enter a description")
      return false
    }
    if (!selectedLocation) {
      setError("Please select a location on the map")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: selectedLocation.name,
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
          priority: formData.priority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create report")
      }

      setSuccess(true)
      setFormData({ title: "", description: "", priority: "Medium" })
      setSelectedLocation(null)

      setTimeout(() => {
        router.push("/reports")
      }, 2000)
    } catch (err) {
      setError("Failed to create report. Please try again.")
      console.error("Error creating report:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isWorker && !isTechnician) {
    return (
      <div className="p-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">Only workers and technicians can create error reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-600/20 bg-green-950/30">
            <CardContent className="pt-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-100 mb-2">Report Created Successfully</h2>
              <p className="text-green-200 mb-6">
                Your error report has been submitted and is now visible on the factory dashboard.
              </p>
              <p className="text-sm text-green-300">Redirecting to reports page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Report New Error</h1>
            <p className="text-muted-foreground">Create a new error report to alert the maintenance team</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Error Details</CardTitle>
            <CardDescription>Provide comprehensive information about the issue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-base font-semibold">
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Conveyor Belt Malfunction"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">Brief summary of the issue</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-semibold">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail, including symptoms and impact..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-32 text-base bg-input border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Be as detailed as possible to help technicians diagnose the problem
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="text-base font-semibold">
                  Priority Level
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger id="priority" disabled={isSubmitting} className="text-base bg-input border-border/50">
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${p.color}`} />
                          {p.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Select the urgency level of this issue</p>
              </div>

              <LocationMapPicker
                locations={FACTORY_LOCATIONS}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />

              <div className="flex gap-3 pt-4">
                <Link href="/reports" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent border-border/50" disabled={isSubmitting}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creating Report..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-secondary/10 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Tips for Better Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Be specific about what you observed (sounds, movements, errors)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Include any error codes or messages if visible</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Mention if the issue is intermittent or constant</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Note any recent changes or operations before the issue occurred</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
