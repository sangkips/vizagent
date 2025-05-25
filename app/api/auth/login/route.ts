import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface User {
    email: string;
    password: string;
}

const users: User[] = [];

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1hr" });

  return NextResponse.json({
    message: "Login successful",
    access_token: token,
  });
}
