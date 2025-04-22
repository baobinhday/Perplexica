'use server';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Check if user is authenticated by verifying JWT token
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    
    if (!token) {
      return false;
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access-secret-key');
    return true;
  } catch (error) {
    return false;
  }
};
