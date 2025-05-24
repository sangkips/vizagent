"use client"

import { useState } from "react"
import ChatPage from "./ChatPage"
import CustomDropdown from "./CustomDropDownMenu"
import UploadCSVButton from "./UploadCsv"

interface Document {
  id: string
  filename: string
  uploaded_at: string
}

interface DocumentListProps {
  documents: Document[]
  onDocumentsChange?: (documents: Document[]) => void
}

export default function DocumentList({ documents, onDocumentsChange }: DocumentListProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [showChatPage, setShowChatPage] = useState<boolean>(false)
  const [localDocuments, setLocalDocuments] = useState<Document[]>(documents)
  const [message, setMessage] = useState<string | null>(null)

  const handleOpenChat = (docId: string) => {
    setSelectedDocumentId(docId)
    setShowChatPage(true)
  }

  const handleCloseChatPage = () => {
    setShowChatPage(false)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/documents/${id}/delete`, {
      method: 'DELETE',
    })
    if (res.ok) {
      const updatedDocuments = localDocuments.filter(doc => doc.id !==id)
      setLocalDocuments(updatedDocuments)


      if (onDocumentsChange) onDocumentsChange(updatedDocuments)
        setMessage("Document deleted successfully")

      setTimeout(() => setMessage(null), 3000)

    } else {
      setMessage("Failed to delete the document")

      setTimeout(() => setMessage(null), 3000)
    }

  }

  // const handleRename = async (id: string, newName: string) => {
  //   const res = await fetch(`/api/documents/${id}/rename`, {
  //     method: 'PATCH',
  //     body: JSON.stringify({ filename: newName }),
  //     headers: { 'Content-Type': 'application/json' },
  //   })

  //   if (res.ok) {
  //     // Refresh or update local state
  //   }
  // }

  const handleUploadSuccess = (newDocument: Document) => {
    console.log("New document received:", newDocument)

    // Ensure the document has all required fields
    if (!newDocument.id || !newDocument.filename) {
      console.error("Invalid document data received:", newDocument)
      return
    }

    // Check if a document with the same ID already exists
    const documentExists = localDocuments.some((doc) => doc.id === newDocument.id)

    if (documentExists) {
      console.warn("Document with ID already exists:", newDocument.id)
      // Update the existing document instead of adding a duplicate
      const updatedDocuments = localDocuments.map((doc) =>
        doc.id === newDocument.id ? { ...doc, ...newDocument } : doc,
      )
      setLocalDocuments(updatedDocuments)

      // If parent component provided a callback, call it with updated documents
      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments)
      }
    } else {
      // Add the new document
      const updatedDocuments = [...localDocuments, newDocument]
      setLocalDocuments(updatedDocuments)

      // If parent component provided a callback, call it with updated documents
      if (onDocumentsChange) {
        onDocumentsChange(updatedDocuments)
      }
    }
  }

  return (
    <>
      {showChatPage && selectedDocumentId ? (
        <ChatPage documentId={selectedDocumentId} onClose={handleCloseChatPage} />
      ) : (

        <div className="container mx-auto py-8 px-4 max-w-6xl">
          {message && (
            <div className="mb-4 p-3 rounded-md text-green-800 bg-green-50 border border-green-100">
              {message}
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
              <p className="text-gray-500 mt-1">Overview of the documents in Personal 1 workspace</p>
            </div>
            <div className="flex gap-2">
              <UploadCSVButton onUploadSuccess={handleUploadSuccess} />
              <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                  <path d="M8 16H3v5"></path>
                  <path d="M16 8h5V3"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center mb-4 space-x-2">
            <div className="flex items-center">
              <input type="checkbox" id="select-all" className="mr-2 h-4 w-4 rounded border-gray-300" />
              <label htmlFor="select-all" className="text-sm text-gray-600">
                Select all
              </label>
            </div>
          </div>

          <div className="flex justify-end mb-4 space-x-2">
            <div className="relative inline-block">
              <button className="px-4 py-1.5 bg-white border rounded-md text-sm flex items-center gap-1">
                Labels <span>▼</span>
              </button>
            </div>
            <div className="relative inline-block">
              <button className="px-4 py-1.5 bg-white border rounded-md text-sm flex items-center gap-1">
                Pages <span>▼</span>
              </button>
            </div>
            <div className="relative inline-block">
              <button className="px-4 py-1.5 bg-white border rounded-md text-sm flex items-center gap-1">
                Dates <span>▼</span>
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6 text-sm">
            <p className="text-gray-700">
              This is a free community plan, documents and associated chats will be removed after 7 days of inactivity.
              <a href="#" className="text-green-500 font-medium ml-1">
                Upgrade your plan
              </a>{" "}
              to ensure your documents and chats are stored securely without any time limits.
            </p>
          </div>

          <div className="space-y-3">
            {localDocuments.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                No documents found. Upload a CSV file to get started.
              </div>
            ) : (
              localDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <input type="checkbox" className="mr-3 h-4 w-4 rounded border-gray-300" />
                  <div className="mr-3 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700">{doc.filename}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                      Add label
                    </button>
                    <CustomDropdown
                      items={[
                        { label: "Open Chat", onClick: () => handleOpenChat(doc.id) },
                        // { label: "Download", onClick: () => {} },
                        // { label: "Rename", onClick: () => handleRename(doc.id, doc.filename) },
                        { label: "Delete", onClick: () => handleDelete(doc.id), className: "text-red-500" },
                      ]}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm">
            <p className="text-purple-800">You have 3 uploads left today with your current community plan.</p>
          </div>
        </div>
      )}
    </>
  )
}
