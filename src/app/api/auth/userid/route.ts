import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "~/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check if the user is authenticated
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { email } = session.user;

    // Check if the session contains an email
    if (!email) {
      return NextResponse.json(
        { error: "Email not found in session" },
        { status: 400 }
      );
    }

    // Query the database for the existing user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    // Return the UID if the user exists
    if (existingUser[0] && existingUser.length > 0) {
      return NextResponse.json({ uid: existingUser[0].id.toString() });
    }

    // Return -1 if the user does not exist
    return NextResponse.json({ uid: -1 });
  } catch (error) {
    // Handle unexpected errors
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user" },
      { status: 500 }
    );
  }
}
