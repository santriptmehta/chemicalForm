import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function GET() {
  try {
    // Define the path to our JSON file
    const filePath = path.join(process.cwd(), "data", "chemicals.json")

    // Try to read existing data, or return empty structure if file doesn't exist
    let data = { industries: [] }
    try {
      const fileContent = await fs.readFile(filePath, "utf8")
      data = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, we'll use the default empty structure
      console.log("No chemicals.json file found, returning empty data")
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching chemical data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch chemical data" }, { status: 500 })
  }
}
