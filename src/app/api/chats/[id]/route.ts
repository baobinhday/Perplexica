import db from '@/lib/db';
import { chats, messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAuthenticated } from '@/lib/utils/auth';

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    // Check if user is authenticated
    const isUserAuthenticated = await isAuthenticated();

    // If authenticated, get chat from database
    if (isUserAuthenticated) {
      const chatExists = await db.query.chats.findFirst({
        where: eq(chats.id, id),
      });

      if (!chatExists) {
        return Response.json({ message: 'Chat not found' }, { status: 404 });
      }

      const chatMessages = await db.query.messages.findMany({
        where: eq(messages.chatId, id),
      });

      return Response.json(
        {
          chat: chatExists,
          messages: chatMessages,
        },
        { status: 200 },
      );
    } else {
      // For non-authenticated users, we'll return a 404
      // The client will handle getting the chat from localStorage
      return Response.json(
        { message: 'Chat not found', isLocalStorage: true },
        { status: 404 }
      );
    }
  } catch (err) {
    console.error('Error in getting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await params;

    // Check if user is authenticated
    const isUserAuthenticated = await isAuthenticated();

    // If authenticated, delete chat from database
    if (isUserAuthenticated) {
      const chatExists = await db.query.chats.findFirst({
        where: eq(chats.id, id),
      });

      if (!chatExists) {
        return Response.json({ message: 'Chat not found' }, { status: 404 });
      }

      await db.delete(chats).where(eq(chats.id, id)).execute();
      await db.delete(messages).where(eq(messages.chatId, id)).execute();

      return Response.json(
        { message: 'Chat deleted successfully' },
        { status: 200 },
      );
    } else {
      // For non-authenticated users, we'll return a success response
      // The client will handle deleting the chat from localStorage
      return Response.json(
        { message: 'Chat deleted successfully', isLocalStorage: true },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error('Error in deleting chat by id: ', err);
    return Response.json(
      { message: 'An error has occurred.' },
      { status: 500 },
    );
  }
};
