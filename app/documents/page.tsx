import DocumentList from "@/components/DocumentList";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering

export default async function DocumentsPage() {
  return <DocumentList documents={[]} />;
}
