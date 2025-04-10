import { NextResponse } from 'next/server';

/**
 * API endpoint to securely provide Google client ID
 * This keeps the client ID from being exposed in client-side environment variables
 */
export async function GET() {
  // Get the client ID from server-side environment variables
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return NextResponse.json({ error: 'Google Client ID is not configured' }, { status: 500 });
  }

  // Return the client ID securely
  return NextResponse.json({ clientId: googleClientId });
}
