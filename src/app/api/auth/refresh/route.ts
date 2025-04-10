import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET || "refresh-secret-key"
    ) as jwt.JwtPayload;

    // Generate new access token
    const ACCESS_EXPIRE = "15m";
    const access_token = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET || "access-secret-key",
      { expiresIn: ACCESS_EXPIRE }
    );

    return NextResponse.json({ 
      access_token,
      expires_in: 900 // 15 minutes in seconds
    });
    
  } catch (error) {
    console.error("Error refreshing token:", error);
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}