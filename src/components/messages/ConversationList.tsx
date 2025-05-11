// src/components/messages/ConversationList.tsx
import { useMessages } from '@/hooks/useMessages';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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
    return <div className="p-4 text-center text-gray-300">Chargement des conversations...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        Vous n'avez pas encore de conversations.
        <p className="mt-2">
          Pour démarrer une conversation, visitez le profil d'un utilisateur qui vous suit et que vous suivez.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-800">
      {conversations.map((conversation) => (
        <Link 
          href={`/messages/${conversation.user.id}`} 
          key={conversation.user.id}
          className="flex items-center p-4 hover:bg-gray-900 transition-colors"
        >
          <div className="relative">
            <Image 
              src={conversation.user.profilePicture || '/default-avatar.png'} 
              alt={conversation.user.nickname} 
              width={50} 
              height={50} 
              className="rounded-full"
            />
          </div>
          <div className="ml-4 flex-1">
            <div className="flex justify-between">
              <h3 className="font-semibold text-white">{conversation.user.nickname}</h3>
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                  addSuffix: false,
                  locale: fr 
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400 truncate max-w-[70%]">
                {conversation.lastMessage.sender_id === conversation.user.id 
                  ? conversation.lastMessage.content 
                  : `Vous: ${conversation.lastMessage.content}`}
              </p>
              {conversation.unreadCount > 0 && (
                <span className="text-xs text-gray-300">
                  • {conversation.unreadCount} {conversation.unreadCount === 1 ? 'Nouveau message' : 'Nouveaux messages'}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}