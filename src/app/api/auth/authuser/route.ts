// app/api/auth/route.ts
import { auth } from "~/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  console.log(session)
  if (!session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If there's a session, do nothing or return a success response
  return NextResponse.json({ session: session });
}
