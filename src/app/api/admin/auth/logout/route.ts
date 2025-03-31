import { NextResponse } from "next/server";

export async function POST() {
  // Create response
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
  
  // Clear the admin_session cookie
  response.cookies.set({
    name: "admin_session",
    value: "",
    expires: new Date(0), // Expire immediately
    path: "/",
  });
  
  return response;
} 