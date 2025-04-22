import db from '@/lib/db';
import { isAuthenticated } from '@/lib/utils/auth';

export const GET = async (req: Request) => {
  try {
    // Check if user is authenticated
    const isUserAuthenticated = await isAuthenticated();

    // If authenticated, get chats from database
    if (isUserAuthenticated) {
      let chats = await db.query.chats.findMany();
      chats = chats.reverse();
      return Response.json({ chats: chats }, { status: 200 });
    } else {
      // For non-authenticated users, we'll return an empty array
      // The client will handle getting chats from localStorage
      return Response.json({ chats: [], isLocalStorage: true }, { status: 200 });
    }
  } catch (err) {
    console.error('Error in getting chats: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
