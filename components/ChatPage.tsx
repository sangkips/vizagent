"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Download } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface ChatResponse {
  response: string
  visualization?: string
  columns?: string[]
}

interface ChatPageProps {
  documentId: string
  onClose: () => void
}

export default function ChatPage({ documentId, onClose }: ChatPageProps) {
  const [, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [visualization, setVisualization] = useState<string | null>(null)
  const [visualizationTitle, setVisualizationTitle] = useState<string>("")
  const [columns, setColumns] = useState<string[]>([])
  const suggestedPrompts = [
    "Show sales trends over the past year",
    "Generate a customer segmentation by age group",
    "Visualize quarterly revenue by region",
    "Show product sales comparison",
    "Display monthly website traffic",
    "Compare marketing campaign performance",
  ]

  // Fetch chat history on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${documentId}/history`)
        if (!response.ok) throw new Error("Failed to fetch chat history")
        const history: ChatMessage[] = await response.json()
        setMessages(history)
      } catch (error) {
        console.error("Error fetching chat history:", error)
      }
    }

    fetchChatHistory()
  }, [documentId])

  const handleGenerate = async (e: React.FormEvent, promptText: string = input) => {
    e.preventDefault()
    if (!promptText.trim()) return

    const newMessage: ChatMessage = { role: "user", content: promptText }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setIsLoading(true)
    setVisualization(null)
    setColumns([])

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptText }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data: ChatResponse = await response.json()
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response || "Visualization generated successfully.",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.visualization) {
        setVisualization(data.visualization)
        setVisualizationTitle(promptText)
      }

      if (data.columns) {
        setColumns(data.columns)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: Could not process your request." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleDownload = () => {
    if (visualization) {
      const filename = visualizationTitle.trim()
        ? `${visualizationTitle.trim().replace(/ /g, "_")}.png`
        : "visualization.png"

      const link = document.createElement("a")
      link.href = `data:image/png;base64,${visualization}`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Convert the input title to a nicer formatted title
  const formatTitle = (title: string): string => {
    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <button onClick={onClose} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" /> Back to documents
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">AI Presentation Assistant</h1>
          <p className="text-gray-600">Generate executive-ready visualizations with natural language</p>
        </div>

        <div className="mb-8">
          <form onSubmit={handleGenerate} className="flex">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
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
                  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                  <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                  <path d="M8 11v5a4 4 0 0 0 8 0v-5"></path>
                </svg>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for a visualization or insight..."
                className="w-full pl-10 pr-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-300 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </form>
        </div>

        {!visualization && (
          <div className="bg-white rounded-xl border p-8">
            <p className="text-center text-gray-600 mb-6">
              {`Try asking for insights like "Show sales trends over the past year" or select from the suggestions below`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedPrompts.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {visualization && (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">{formatTitle(visualizationTitle)}</h2>
                <button onClick={handleDownload} className="flex items-center text-blue-600 hover:text-blue-800">
                  <Download size={16} className="mr-1" /> Download
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={`data:image/png;base64,${visualization}`}
                  alt="Visualization"
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
              {columns.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">Available columns: {columns.join(", ")}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
