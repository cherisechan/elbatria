import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

interface SessionData {
  session: {
    user: {
      name: string;
      email: string;
      image: string;
    };
    expires: string;
  }
}


export async function POST(request: Request) {
  const body = (await request.json()) as SessionData;
  const { session } = body;
  try {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const { email } = session.user;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in session" },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser[0] && existingUser.length > 0) {
      return NextResponse.json({ uid: existingUser[0].id.toString() });
    }

    return NextResponse.json({ uid: -1 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the user" },
      { status: 500 }
    );
  }
}
