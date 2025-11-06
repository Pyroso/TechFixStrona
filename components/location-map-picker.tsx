"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"

interface Location {
  name: string
  lat: number
  lng: number
}

interface LocationMapPickerProps {
  locations?: Location[]
  selectedLocation: Location | null
  onLocationSelect: (location: Location) => void
}

// Predefined factory locations
const FACTORY_LOCATIONS = [
  { name: "Assembly Line A", lat: 40.7128, lng: -74.006 },
  { name: "Assembly Line B", lat: 40.713, lng: -74.0055 },
  { name: "Warehouse A", lat: 40.7135, lng: -74.0022 },
  { name: "Warehouse B", lat: 40.712, lng: -74.005 },
  { name: "Production Line C", lat: 40.714, lng: -74.008 },
  { name: "Control Room", lat: 40.712, lng: -74.0055 },
  { name: "Maintenance Bay", lat: 40.7115, lng: -74.0065 },
]

export function LocationMapPicker({ selectedLocation, onLocationSelect }: LocationMapPickerProps) {
  const [highlightedLocation, setHighlightedLocation] = useState<string | null>(selectedLocation?.name || null)

  useEffect(() => {
    setHighlightedLocation(selectedLocation?.name || null)
  }, [selectedLocation])

  const handleLocationSelect = (location: Location) => {
    setHighlightedLocation(location.name)
    onLocationSelect(location)
  }

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold flex items-center gap-2">
        <MapPin className="w-4 h-4 text-orange-500" />
        Factory Location
      </Label>

      {/* Industrial grid layout of factory zones */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-black/30 border border-orange-500/20 rounded-lg">
        {FACTORY_LOCATIONS.map((location) => {
          const isSelected = selectedLocation?.name === location.name
          return (
            <button
              key={location.name}
              onClick={() => handleLocationSelect(location)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected
                  ? "border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/20"
                  : "border-orange-500/30 bg-black/40 hover:border-orange-500/60 hover:bg-black/60"
              }`}
            >
              <div className="flex items-start gap-2">
                <MapPin
                  className={`w-3 h-3 flex-shrink-0 mt-1 ${isSelected ? "text-orange-400" : "text-orange-600"}`}
                />
                <span className={`text-xs font-semibold ${isSelected ? "text-orange-300" : "text-orange-200"}`}>
                  {location.name.split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
              {isSelected && (
                <div className="mt-2 text-xs text-orange-300 font-mono">
                  {location.lat.toFixed(2)}° {location.lng.toFixed(2)}°
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick select badges */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Quick Select:</Label>
        <div className="flex flex-wrap gap-2">
          {FACTORY_LOCATIONS.map((location) => (
            <Badge
              key={location.name}
              variant={selectedLocation?.name === location.name ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                selectedLocation?.name === location.name
                  ? "bg-orange-600 hover:bg-orange-700 text-white border-orange-600"
                  : "hover:border-orange-500/50"
              }`}
              onClick={() => handleLocationSelect(location)}
            >
              {location.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Selected location summary */}
      {selectedLocation && (
        <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-xs text-orange-300 font-semibold mb-2">SELECTED LOCATION</p>
          <p className="text-sm font-semibold text-orange-100 mb-1">{selectedLocation.name}</p>
          <div className="text-xs font-mono text-orange-200/70">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  )
}
