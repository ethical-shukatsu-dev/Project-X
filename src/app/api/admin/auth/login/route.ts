import { NextRequest, NextResponse } from 'next/server';

// Secret key for admin authentication
const API_SECRET_KEY = process.env.API_SECRET_KEY;

// Session duration - 24 hours in seconds
const SESSION_DURATION = 60 * 60 * 24;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ message: 'Password is required' }, { status: 400 });
    }

    // Verify the password against the API_SECRET_KEY
    if (password !== API_SECRET_KEY) {
      return NextResponse.json({ message: 'Invalid admin password' }, { status: 401 });
    }

    // Create a response and set the cookie
    const response = NextResponse.json({ message: 'Authenticated successfully' }, { status: 200 });

    // Set a secure HTTP-only cookie for admin session
    response.cookies.set({
      name: 'admin_session',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_DURATION,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 500 });
  }
}
