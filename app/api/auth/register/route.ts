import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

const users: any[] = [];

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ email, password: hashedPassword });

    return NextResponse.json({ message: "User registered successfully" });
}
