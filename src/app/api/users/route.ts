import { NextResponse } from "next/server";
import db from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// Handler for creating a new user
export async function POST(req: Request) {
  try {
    const { username, name, password } = await req.json();

    if (!username || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user with hashed password
    const newUser = await db.insert(users).values({
      username,
      name,
      password: hashedPassword,
    }).returning();

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handler for getting all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}