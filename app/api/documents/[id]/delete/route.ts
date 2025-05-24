import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,{
            method: 'DELETE',
        });

        if (!response.ok){
            throw new Error("Failed to delete document");
        }

        return NextResponse.json({message: 'Document deleted'});
    } catch(error) {
        return NextResponse.json({error: (error as Error).message}, {status: 500});
    }

}