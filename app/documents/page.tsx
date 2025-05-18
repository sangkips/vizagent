import DocumentList from '@/components/DocumentList';

interface Document {
  id: string;
  filename: string;
  uploaded_at: string;
}

async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch('http://localhost:8000/api/documents', { cache: 'no-store' });
    if (!response.ok) {
      
      throw new Error('Failed to fetch documents');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    return [];
  }
}

export default async function DocumentsPage() {
  const documents = await fetchDocuments();
  return <DocumentList documents={documents} />;
}