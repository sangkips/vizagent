import DocumentList from '@/components/DocumentList';

interface Document {
  id: string;
  filename: string;
  cid: string;
  file_url: string;
  uploaded_at: string;
}

async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents`, { cache: 'no-store' });
    if (!response.ok) {
      
      throw new Error('Failed to fetch documents');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export default async function DocumentsPage() {
  const documents = await fetchDocuments();
  return <DocumentList documents={documents} />;
}

