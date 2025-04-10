import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify and decode token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "access-secret-key"
    ) as jwt.JwtPayload;

    // Get user from database
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user[0]);
    
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}