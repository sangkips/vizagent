"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload } from "lucide-react"

interface UploadedDocument {
  id: string
  filename: string
  uploaded_at: string
}

interface UploadCSVButtonProps {
  onUploadSuccess: (newDocument: UploadedDocument) => void
}

export default function UploadCSVButton({ onUploadSuccess }: UploadCSVButtonProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload-csv`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Upload failed" }))
        throw new Error(errorData.detail || "Failed to upload file")
      }

      const result = await response.json()
      console.log("Full upload response:", result)
      
      const fileData = result

      if (!fileData) {
        console.error("No file object found in response:", result)
        throw new Error("Invalid response format: missing file data")
      }

      console.log("File data extracted:", fileData)

      if (!fileData.id) {
        console.error("No ID found in file data:", fileData)
        throw new Error("Invalid response format: missing file ID")
      }

      const newDocument = {
        id: fileData.id,
        filename: fileData.filename || file.name,
        uploaded_at: fileData.uploaded_at || new Date().toISOString(),
      }

      onUploadSuccess(newDocument)

      // Show success message
      alert("File uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setUploadError("Please select a CSV file")
        return
      }
      handleUpload(file)
    }
  }

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
        disabled={isUploading}
      />
      <button
        onClick={handleClick}
        disabled={isUploading}
        className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-600 rounded-md border border-green-200 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <Upload size={16} className="text-green-500" />
            Upload CSV
          </>
        )}
      </button>
      {uploadError && <p className="text-red-500 text-sm mt-1">{uploadError}</p>}
    </div>
  )
}
