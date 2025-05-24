import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const users: any[] = []

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export async function POST(request: NextRequest){
    const { email, password} = await request.json()
    const user = users.find(u => u.email === email)

    if (!user) {
        return NextResponse.json({error: "Invalid email or paddword"}, {status: 401})
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return NextResponse.json({error: "Invalid email or password"}, {status: 401})
    }

    const token = jwt.sign({email}, JWT_SECRET, {expiresIn: '1hr'})

    const response = NextResponse.json({ message: 'Login successful' })
    response.cookies.set('token', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax'
    })

    return response

}