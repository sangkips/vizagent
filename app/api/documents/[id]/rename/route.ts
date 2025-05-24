import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    const { id } = await params
    const { filename } = await request.json()

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${id}`,{
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({filename}),
        })
        if (!response.ok){
            throw new Error("Failed to rename the document")
        }

        return NextResponse.json({message: "Document renamed"})  
    } catch (error) {
        return NextResponse.json({error: (error as Error).message}, {status: 500})
    }

}