const mockDatabase = {}

function initializeSampleData() {
  const sampleReports = [
    {
      id: "1",
      title: "Conveyor Belt Malfunction",
      description: "Belt is moving slower than normal, potential motor issue",
      location: "Assembly Line A",
      latitude: 40.7128,
      longitude: -74.006,
      priority: "High",
      status: "In Progress",
      assignedTechnician: "John Smith",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      title: "Hydraulic Pump Leak",
      description: "Detected oil leak from main hydraulic pump",
      location: "Warehouse B",
      latitude: 40.7135,
      longitude: -74.0022,
      priority: "Critical",
      status: "New",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      title: "Electrical Panel Fault",
      description: "Breaker keeps tripping on Panel C, possible short circuit",
      location: "Control Room",
      latitude: 40.712,
      longitude: -74.0055,
      priority: "Medium",
      status: "New",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      title: "Sensor Calibration Error",
      description: "Temperature sensor reading inconsistencies",
      location: "Production Line C",
      latitude: 40.714,
      longitude: -74.008,
      priority: "Low",
      status: "Resolved",
      assignedTechnician: "Sarah Johnson",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ]

  sampleReports.forEach((report) => {
    mockDatabase[report.id] = report
  })
}

initializeSampleData()

export const db = {
  getAllReports: () => {
    return Object.values(mockDatabase).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  getReport: (id) => {
    return mockDatabase[id] || null
  },

  createReport: (data) => {
    const id = Date.now().toString()
    const now = new Date().toISOString()

    const report = {
      id,
      ...data,
      status: "New",
      timestamp: now,
      createdAt: now,
      updatedAt: now,
    }

    mockDatabase[id] = report
    return report
  },

  updateReport: (id, data) => {
    const report = mockDatabase[id]
    if (!report) return null

    const updated = {
      ...report,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    mockDatabase[id] = updated
    return updated
  },

  deleteReport: (id) => {
    if (mockDatabase[id]) {
      delete mockDatabase[id]
      return true
    }
    return false
  },

  getStats: () => {
    const reports = Object.values(mockDatabase)
    return {
      total: reports.length,
      new: reports.filter((r) => r.status === "New").length,
      inProgress: reports.filter((r) => r.status === "In Progress").length,
      resolved: reports.filter((r) => r.status === "Resolved").length,
    }
  },
}
