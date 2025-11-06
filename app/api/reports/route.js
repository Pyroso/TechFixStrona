import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const location = searchParams.get("location")

    let reports = db.getAllReports()

    if (status) {
      reports = reports.filter((r) => r.status === status)
    }

    if (location) {
      reports = reports.filter((r) => r.location.toLowerCase().includes(location.toLowerCase()))
    }

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    if (!body.title || !body.description || !body.location || !body.priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const report = db.createReport(body)
    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error("Error creating report:", error)
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 })
  }
}
