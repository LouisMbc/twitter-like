// src/components/messages/ConversationList.tsx
import { useMessages } from '@/hooks/useMessages';
import Link from 'next/link';
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
    return (
      <div className="p-4 text-center text-gray-300">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600 mx-auto"></div>
        <div className="mt-4">Chargement des conversations...</div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Aucune conversation</h3>
        <p className="text-sm">
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
          className="flex items-center p-4 hover:bg-gray-900 transition-colors border-l-4 border-transparent hover:border-red-500"
        >
          <div className="relative mr-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600">
              {conversation.user.profilePicture ? (
                <img
                  src={conversation.user.profilePicture}
                  alt={conversation.user.nickname}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-medium">
                  {conversation.user.nickname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h3 className={`font-medium ${conversation.unreadCount > 0 ? 'text-white' : 'text-gray-300'} truncate`}>
                {conversation.user.nickname}
              </h3>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {formatDistanceToNow(new Date(conversation.lastMessage.created_at), { 
                  addSuffix: false,
                  locale: fr 
                })}
              </span>
            </div>
            <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
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