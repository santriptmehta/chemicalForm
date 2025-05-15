import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Define the path to our JSON file
    const filePath = path.join(process.cwd(), "data", "chemicals.json")

    // Create the data directory if it doesn't exist
    try {
      await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true })
    } catch (error) {
      console.error("Error creating directory:", error)
    }

    // Try to read existing data, or create a new structure if file doesn't exist
    let existingData = { industries: [] }
    try {
      const fileContent = await fs.readFile(filePath, "utf8")
      existingData = JSON.parse(fileContent)
    } catch (error) {
      // File doesn't exist or is invalid, we'll use the default empty structure
      console.log("Creating new chemicals.json file")
    }

    // Process the data similar to your original logic
    const { industryType, newChemical } = data

    // Ensure all fields have at least empty strings
    const processedChemical = {
      name: newChemical.name || "",
      description: newChemical.description || "",
      category: newChemical.category || "",
      cas_number: newChemical.cas_number || "",
      molecular_formula: newChemical.molecular_formula || "",
      cines_number: newChemical.cines_number || "",
      properties: newChemical.properties || [],
      application: newChemical.application || [],
      storage: newChemical.storage || [],
    }

    // Check if industry already exists
    const industryIndex = existingData.industries.findIndex(
      (ind: any) => ind.industry_name.toLowerCase() === industryType.toLowerCase(),
    )

    if (industryIndex !== -1) {
      // Add chemical to existing industry
      existingData.industries[industryIndex].chemicals.push(processedChemical)
    } else {
      // Create new industry with the chemical
      existingData.industries.push({
        industry_name: industryType,
        chemicals: [processedChemical],
      })
    }

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2))

    return NextResponse.json({
      success: true,
      message: "Chemical information saved successfully!",
      data: existingData,
    })
  } catch (error) {
    console.error("Error saving chemical data:", error)
    return NextResponse.json({ success: false, message: "Failed to save chemical data" }, { status: 500 })
  }
}
