"use client"

import { useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"

// KeyValuePairInput Component
function KeyValuePairInput({ pairs, onChange, keyPlaceholder = "Key", valuePlaceholder = "Value" }) {
  const handleKeyChange = (index, newKey) => {
    const newPairs = [...pairs]
    newPairs[index].key = newKey
    onChange(newPairs)
  }

  const handleValueChange = (index, newValue) => {
    const newPairs = [...pairs]
    newPairs[index].value = newValue
    onChange(newPairs)
  }

  const addPair = () => {
    onChange([...pairs, { key: "", value: "" }])
  }

  const removePair = (index) => {
    if (pairs.length > 1) {
      const newPairs = [...pairs]
      newPairs.splice(index, 1)
      onChange(newPairs)
    }
  }

  return (
    <div className="space-y-3">
      {pairs.map((pair, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={pair.key}
              onChange={(e) => handleKeyChange(index, e.target.value)}
              placeholder={keyPlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={pair.value}
              onChange={(e) => handleValueChange(index, e.target.value)}
              placeholder={valuePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => removePair(index)}
            className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
            aria-label="Remove item"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addPair}
        className="flex items-center text-blue-600 hover:text-blue-800 focus:outline-none"
      >
        <PlusCircle size={18} className="mr-1" />
        <span>Add another</span>
      </button>
    </div>
  )
}

// JsonDisplay Component
function JsonDisplay({ data, onBack }) {
  const [copied, setCopied] = useState(false)
  const jsonString = JSON.stringify(data, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">JSON Data</h2>
        <div className="space-x-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Back to Form
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[70vh]">
        <pre className="text-sm">{jsonString}</pre>
      </div>
    </div>
  )
}

// Main App Component
export default function App() {
  const [industryType, setIndustryType] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [casNumber, setCasNumber] = useState("")
  const [molecularFormula, setMolecularFormula] = useState("")
  const [cinecsNumber, setCinecsNumber] = useState("")

  const [properties, setProperties] = useState([{ key: "", value: "" }])
  const [applications, setApplications] = useState([{ key: "", value: "" }])
  const [storage, setStorage] = useState([{ key: "", value: "" }])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [jsonData, setJsonData] = useState(null)
  const [showJson, setShowJson] = useState(false)

  // Function to reset form
  const resetForm = () => {
    setName("")
    setDescription("")
    setCategory("")
    setCasNumber("")
    setMolecularFormula("")
    setCinecsNumber("")
    setProperties([{ key: "", value: "" }])
    setApplications([{ key: "", value: "" }])
    setStorage([{ key: "", value: "" }])
  }

  // Function to fetch JSON data
  const fetchJsonData = async () => {
    try {
      const response = await fetch("/api/get-chemical-data")
      if (response.ok) {
        const data = await response.json()
        setJsonData(data)
        setShowJson(true)
      } else {
        setMessage("Failed to fetch JSON data")
      }
    } catch (error) {
      setMessage("Error fetching JSON data: " + error.message)
    }
  }

  // Function to download JSON
  const downloadJson = async () => {
    try {
      const response = await fetch("/api/get-chemical-data")
      if (response.ok) {
        const data = await response.json()
        const jsonString = JSON.stringify(data, null, 2)
        const blob = new Blob([jsonString], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "chemicals.json"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        setMessage("Failed to download JSON data")
      }
    } catch (error) {
      setMessage("Error downloading JSON data: " + error.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      // Filter out empty key-value pairs
      const filteredProperties = properties.filter((item) => item.key.trim() !== "" && item.value.trim() !== "")
      const filteredApplications = applications.filter((item) => item.key.trim() !== "" && item.value.trim() !== "")
      const filteredStorage = storage.filter((item) => item.key.trim() !== "" && item.value.trim() !== "")

      // Create the chemical object
      const newChemical = {
        name,
        description,
        category,
        cas_number: casNumber,
        molecular_formula: molecularFormula,
        cines_number: cinecsNumber,
        properties: filteredProperties,
        application: filteredApplications,
        storage: filteredStorage,
      }

      // Send data to the API endpoint to save to a local JSON file
      const response = await fetch("/api/save-chemical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industryType,
          newChemical,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        // Reset form after successful submission
        resetForm()
      } else {
        throw new Error(result.message || "Failed to save data")
      }
    } catch (error) {
      setMessage("An error occurred while saving: " + error.message)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Chemical Information Form</h1>

      {showJson ? (
        <JsonDisplay data={jsonData} onBack={() => setShowJson(false)} />
      ) : (
        <>
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={fetchJsonData}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              View JSON
            </button>
            <button
              onClick={downloadJson}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Download JSON
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
            {message && (
              <div
                className={`mb-4 p-3 rounded ${
                  message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                }`}
              >
                {message}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="industryType" className="block text-gray-700 font-medium mb-2">
                Industry Type
              </label>
              <select
                id="industryType"
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Food & Feed Additives">Food & Feed Additives</option>
                <option value="Pharm & Intermediates">Pharm & Intermediates</option>
                <option value="Inorganic">Inorganic</option>
                <option value="Listing">Listing</option>
              </select>
            </div>

            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Chemical Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="casNumber" className="block text-gray-700 font-medium mb-2">
                  CAS Number
                </label>
                <input
                  type="text"
                  id="casNumber"
                  value={casNumber}
                  onChange={(e) => setCasNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="molecularFormula" className="block text-gray-700 font-medium mb-2">
                  Molecular Formula
                </label>
                <input
                  type="text"
                  id="molecularFormula"
                  value={molecularFormula}
                  onChange={(e) => setMolecularFormula(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="cinecsNumber" className="block text-gray-700 font-medium mb-2">
                  CINECS Number
                </label>
                <input
                  type="text"
                  id="cinecsNumber"
                  value={cinecsNumber}
                  onChange={(e) => setCinecsNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Properties</h3>
              <KeyValuePairInput
                pairs={properties}
                onChange={setProperties}
                keyPlaceholder="Property name"
                valuePlaceholder="Property value"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Applications</h3>
              <KeyValuePairInput
                pairs={applications}
                onChange={setApplications}
                keyPlaceholder="Application type"
                valuePlaceholder="Application details"
              />
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Storage</h3>
              <KeyValuePairInput
                pairs={storage}
                onChange={setStorage}
                keyPlaceholder="Storage aspect"
                valuePlaceholder="Storage requirements"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Submit Chemical Information"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  )
}
