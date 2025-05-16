// src/components/messages/ConversationList.tsx
import { useMessages } from '@/hooks/useMessages';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Ajout du type Conversation pour éviter les erreurs TS
type Conversation = {
  user: {
    id: string | number;
    profilePicture: string | null;
    nickname: string;
  };
  lastMessage: {
    created_at: string | Date;
    sender_id: string | number;
    content: string;
  };
  unreadCount: number;
};

export default function ConversationList() {
  const { conversations, loading, error } = useMessages() as {
    conversations: Conversation[];
    loading: boolean;
    error: string | null;
  };

  if (loading) {
    return <div className="p-4 text-center">Chargement des conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Vous n'avez pas encore de conversations.
        <p className="mt-2">
          Pour démarrer une conversation, visitez le profil d'un utilisateur qui vous suit et que vous suivez.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <Link 
          href={`/messages/${conversation.user.id}`} 
          key={conversation.user.id}
          className="flex items-center p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="relative">
            <Image 
              src={conversation.user.profilePicture || '/default-avatar.png'} 
              alt={conversation.user.nickname} 
              width={50} 
              height={50} 
              className="rounded-full"
            />
            {conversation.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <h3 className="font-semibold text-white hover:text-black">{conversation.user.nickname}</h3>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                  addSuffix: true,
                  locale: fr 
                })}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {conversation.lastMessage.sender_id === conversation.user.id 
                ? conversation.lastMessage.content 
                : `Vous: ${conversation.lastMessage.content}`}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}