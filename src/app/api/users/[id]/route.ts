import { NextResponse } from "next/server";
import db from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Handler for getting a specific user by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handler for updating a specific user by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);
    const { username, name, password } = await req.json();

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new username already exists (if username is being updated)
    if (username && username !== existingUser[0].username) {
      const usernameCheck = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (usernameCheck.length > 0) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }
    }

    // Update user
    const updatedUser = await db
      .update(users)
      .set({
        username: username || existingUser[0].username,
        name: name || existingUser[0].name,
        password: password || existingUser[0].password, // In a real application, hash the password if updated
      })
      .where(eq(users.id, userId))
      .returning();

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Handler for deleting a specific user by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = parseInt(params.id);
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}