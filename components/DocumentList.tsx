"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatPage from "./ChatPage";
import CustomDropdown from "./CustomDropDownMenu";
import UploadCSVButton from "./UploadCsv";

interface Document {
  id: string;
  filename: string;
  cid: string;
  file_url: string;
  uploaded_at: string;
}

interface DocumentListProps {
  documents: Document[];
  onDocumentsChange?: (documents: Document[]) => void;
}

export default function DocumentList({
  documents,
  onDocumentsChange,
}: DocumentListProps) {
  const router = useRouter();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [showChatPage, setShowChatPage] = useState<boolean>(false);
  const [localDocuments, setLocalDocuments] = useState<Document[]>(documents);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null until checked

  // Check authentication on mount
  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsAuthenticated(false);
        router.push("/login?redirect=/documents");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      try {
        if (typeof window === "undefined") return; // Skip on server
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login?redirect=/documents");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/documents`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login?redirect=/documents");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.statusText}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          setLocalDocuments([]);
        } else {
          setLocalDocuments(data);
          if (onDocumentsChange) onDocumentsChange(data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to fetch documents. Please try again.");
        setLocalDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [onDocumentsChange, router, isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login?redirect=/documents");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      const updatedDocuments = localDocuments.filter((doc) => doc.id !== id);
      setLocalDocuments(updatedDocuments);
      if (onDocumentsChange) onDocumentsChange(updatedDocuments);
      setMessage("Document deleted successfully");
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage("Failed to delete the document");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  type UploadedDocument = {
    id: string;
    filename: string;
    cid?: string;
    file_url?: string;
    uploaded_at?: string;
  };

  const handleUploadSuccess = (uploaded: UploadedDocument) => {
    const newDocument: Document = {
      ...uploaded,
      cid: uploaded.cid ?? "",
      file_url: uploaded.file_url ?? "",
      uploaded_at: new Date().toISOString(),
    };
    console.log("New document received:", newDocument);

    if (!newDocument.id || !newDocument.filename) {
      console.error("Invalid document data received:", newDocument);
      return;
    }
    const documentExists = localDocuments.some(
      (doc) => doc.id === newDocument.id
    );

    if (documentExists) {
      console.warn("Document with ID already exists:", newDocument.id);
      const updatedDocuments = localDocuments.map((doc) =>
        doc.id === newDocument.id ? { ...doc, ...newDocument } : doc
      );
      setLocalDocuments(updatedDocuments);
      if (onDocumentsChange) onDocumentsChange(updatedDocuments);
    } else {
      const updatedDocuments = [...localDocuments, newDocument];
      setLocalDocuments(updatedDocuments);
      if (onDocumentsChange) onDocumentsChange(updatedDocuments);
    }
  };

  const handleOpenChat = (docId: string) => {
    setSelectedDocumentId(docId);
    setShowChatPage(true);
  };

  const handleCloseChatPage = () => {
    setShowChatPage(false);
  };

  // Don't render until authentication is checked
  if (isAuthenticated === null || isAuthenticated === false) {
    return null; // Prevent rendering while redirecting
  }

  return (
    <>
      {showChatPage && selectedDocumentId ? (
        <ChatPage
          documentId={selectedDocumentId}
          onClose={handleCloseChatPage}
        />
      ) : (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          {message && (
            <div className="mb-4 p-3 rounded-md text-green-800 bg-green-50 border border-green-100">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded-md text-red-800 bg-red-50 border border-red-100">
              {error}
            </div>
          )}
          {isLoading && (
            <div className="text-center py-16 text-gray-500">
              Loading documents...
            </div>
          )}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Documents</h1>
              <p className="text-gray-500 mt-1">
                Overview of the documents in Personal 1 workspace
              </p>
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
              <input
                type="checkbox"
                id="select-all"
                className="mr-2 h-4 w-4 rounded border-gray-300"
              />
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
              This is a free community plan, documents and associated chats will
              be removed after 7 days of inactivity.
              <a href="#" className="text-green-500 font-medium ml-1">
                Upgrade your plan
              </a>{" "}
              to ensure your documents and chats are stored securely without any
              time limits.
            </p>
          </div>

          <div className="space-y-3">
            {localDocuments.length === 0 && !isLoading ? (
              <div className="text-center py-16 text-gray-500">
                No documents found. Upload a CSV file to get started.
              </div>
            ) : (
              localDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mr-3 h-4 w-4 rounded border-gray-300"
                  />
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
                    <span className="font-medium text-gray-700">
                      {doc.filename}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors">
                      Add label
                    </button>
                    <CustomDropdown
                      items={[
                        {
                          label: "Open Chat",
                          onClick: () => handleOpenChat(doc.id),
                        },
                        {
                          label: "Delete",
                          onClick: () => handleDelete(doc.id),
                          className: "text-red-500",
                        },
                      ]}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm">
            <p className="text-purple-800">
              You have 3 uploads left today with your current community plan.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
