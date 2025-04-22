import { Message } from '@/components/ChatWindow';

// Type definitions
export interface LocalStorageChat {
  id: string;
  title: string;
  createdAt: string;
  focusMode: string;
  files: { name: string; fileId: string }[];
  messages: LocalStorageMessage[];
}

export interface LocalStorageMessage {
  messageId: string;
  chatId: string;
  content: string;
  role: 'user' | 'assistant';
  metadata: string; // JSON string containing createdAt and sources
}



// Client-side function to check if user is authenticated
export const isAuthenticatedClient = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('access_token');
  return !!token;
};

// Save chat to localStorage
export const saveToLocalStorage = (chat: LocalStorageChat): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Get existing chats or initialize empty array
  const existingChatsStr = localStorage.getItem('chats');
  const existingChats: LocalStorageChat[] = existingChatsStr
    ? JSON.parse(existingChatsStr)
    : [];

  // Check if chat already exists
  const chatIndex = existingChats.findIndex(c => c.id === chat.id);

  if (chatIndex >= 0) {
    // Update existing chat
    existingChats[chatIndex] = chat;
  } else {
    // Add new chat
    existingChats.push(chat);
  }

  // Save back to localStorage
  localStorage.setItem('chats', JSON.stringify(existingChats));
};

// Get all chats from localStorage
export const getChatsFromLocalStorage = (): LocalStorageChat[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  const chatsStr = localStorage.getItem('chats');
  return chatsStr ? JSON.parse(chatsStr) : [];
};

// Get a specific chat from localStorage
export const getChatFromLocalStorage = (chatId: string): LocalStorageChat | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const chats = getChatsFromLocalStorage();
  return chats.find(chat => chat.id === chatId) || null;
};

// Save a message to localStorage
export const saveMessageToLocalStorage = (
  message: Message,
  chatId: string,
  focusMode: string,
  files: string[] = []
): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // Get existing chat or create new one
  let chat = getChatFromLocalStorage(chatId);

  if (!chat) {
    // Create new chat
    chat = {
      id: chatId,
      title: message.content, // Use first message as title
      createdAt: new Date().toString(),
      focusMode: focusMode,
      files: files.map(fileId => {
        // Try to get file details if available
        try {
          const fileDetailsStr = localStorage.getItem(`file_${fileId}`);
          if (fileDetailsStr) {
            return JSON.parse(fileDetailsStr);
          }
        } catch (e) {
          console.error('Error parsing file details', e);
        }

        return { name: 'Unknown file', fileId };
      }),
      messages: []
    };
  }

  // Check if message already exists
  const messageIndex = chat.messages.findIndex(m => m.messageId === message.messageId);

  const messageToSave: LocalStorageMessage = {
    messageId: message.messageId,
    chatId: chatId,
    content: message.content,
    role: message.role,
    metadata: JSON.stringify({
      createdAt: message.createdAt || new Date(),
      ...(message.sources && { sources: message.sources })
    })
  };

  if (messageIndex >= 0) {
    // Update existing message
    chat.messages[messageIndex] = messageToSave;

    // Remove all messages after this one (for rewrite functionality)
    chat.messages = chat.messages.slice(0, messageIndex + 1);
  } else {
    // Add new message
    chat.messages.push(messageToSave);
  }

  // Save updated chat
  saveToLocalStorage(chat);
};

// Delete a chat from localStorage
export const deleteChatFromLocalStorage = (chatId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const chats = getChatsFromLocalStorage();
  const updatedChats = chats.filter(chat => chat.id !== chatId);
  localStorage.setItem('chats', JSON.stringify(updatedChats));
};

// Migrate chats from localStorage to database when user logs in
export const migrateChatsToDatabase = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  const chats = getChatsFromLocalStorage();

  if (chats.length === 0) {
    return;
  }

  // TODO: Implement API call to migrate chats to database
  // This would require a new API endpoint
};
