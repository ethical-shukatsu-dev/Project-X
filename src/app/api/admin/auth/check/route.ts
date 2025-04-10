import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check if the admin session cookie is present
  const session = request.cookies.get('admin_session');

  if (session?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true }, { status: 200 });
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}
