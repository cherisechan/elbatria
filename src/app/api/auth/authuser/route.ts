// // app/api/auth/route.ts
// import { auth } from "~/auth";
// import { NextResponse } from "next/server";

// export async function POST(request: Request) {
//   const session = await auth();

//   console.log('------from auth-----')
//   console.log(session)
//   if (!session) {
//     return NextResponse.redirect(new URL('/', request.url))
//   }
//   // If there's a session, do nothing or return a success response
//   return NextResponse.json({ session: session });
// }


import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "~/auth";


interface SessionData {
  user: {
    name: string;
    email: string;
    image: string;
  };
  expires: string;
}


export async function POST(request: Request) {
  const session = await auth();

  console.log("------from auth-----");
  console.log(session);

  if (!session?.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const {email} = session.user;
  if (!email) {
    return NextResponse.json(
      { error: "Email not found in session" },
      { status: 400 }
    );
  }
  const existingUser = await db.select().from(users).where(eq(users.email, email))
  console.log(existingUser)
  if (existingUser && existingUser.length == 0) {
    const [newUser] = await db.insert(users).values({ email: email }).returning({ id: users.id });
    if (newUser) {
      console.log(`New user created: ${newUser.id}`);
    }
  }

  return NextResponse.json({ session: session });
}
