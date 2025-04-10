import { NextResponse } from 'next/server';
import db from '@/lib/db/index';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// Handler for user login
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing username or password' },
        { status: 400 },
      );
    }

    // Find the user by username
    const user = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 },
      );
    }

    // Generate tokens with separate expiration times
    const ACCESS_EXPIRE = '1d';
    const REFRESH_EXPIRE = '7d';

    const access_token = jwt.sign(
      { userId: user[0].id, username: user[0].username },
      process.env.JWT_ACCESS_SECRET || 'access-secret-key',
      { expiresIn: ACCESS_EXPIRE },
    );

    const refresh_token = jwt.sign(
      { userId: user[0].id },
      process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      { expiresIn: REFRESH_EXPIRE },
    );

    return NextResponse.json({
      access_token,
      refresh_token,
      expires_in: 24 * 60 * 60, // 24 hours in seconds
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
