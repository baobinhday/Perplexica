import { Trash } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { Chat } from '@/app/library/page';
import { Button } from './ui/button';
import { LoadingSpinner } from './ui/loading-spinner';
import { isAuthenticatedClient } from '@/lib/utils/storage';
import { deleteChatFromLocalStorage } from '@/lib/utils/storage';

const DeleteChat = ({
  chatId,
  chats,
  setChats,
  redirect = false,
}: {
  chatId: string;
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  redirect?: boolean;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      // Check if user is authenticated
      const isAuthenticated = isAuthenticatedClient();

      if (isAuthenticated) {
        // Delete from database via API
        const res = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (res.status != 200) {
          throw new Error('Failed to delete chat');
        }
      } else {
        // Delete from localStorage
        deleteChatFromLocalStorage(chatId);
      }

      // Update UI
      const newChats = chats.filter((chat) => chat.id !== chatId);
      setChats(newChats);

      if (redirect) {
        window.location.href = '/';
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-400 hover:text-red-500 transition duration-100"
        >
          <Trash size={17} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Confirmation</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this chat?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {loading && (
              <LoadingSpinner
                type="long"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChat;
