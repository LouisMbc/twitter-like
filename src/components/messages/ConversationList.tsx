// src/components/messages/ConversationList.tsx
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ConversationListProps {
  onSelectConversation: (userId: string) => Promise<void>;
  selectedUserId: string | null;
}

export default function ConversationList({ onSelectConversation, selectedUserId }: ConversationListProps) {
  const { conversations, loading, error } = useMessages();

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
      {conversations.map((conversation: any) => {
        // Utiliser les propriétés directes de la conversation
        const conversationId = conversation.id;
        const nickname = conversation.nickname || 'Utilisateur';
        const profilePicture = conversation.profilePicture;
        const unreadCount = conversation.unreadCount || 0;
        const lastMessageAt = conversation.last_message_at;
        const lastMessage = conversation.lastMessage?.content || 'Aucun message';

        if (!conversationId) {
          return null;
        }

        return (
          <div 
            key={conversationId}
            onClick={() => onSelectConversation(conversationId)}
            className={`flex items-center p-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 transition-colors border-l-4 cursor-pointer ${
              selectedUserId === conversationId 
                ? 'border-red-500 bg-gray-200/50 dark:bg-gray-800/50' 
                : 'border-transparent hover:border-red-500'
            }`}
          >
            <div className="relative mr-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600">
                {profilePicture ? (
                  <img
                    src={profilePicture}
                    alt={nickname}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-medium">
                    {nickname ? nickname.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-medium ${unreadCount > 0 ? 'text-white' : 'text-gray-300'} truncate`}>
                  {nickname}
                </h3>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {lastMessageAt && formatDistanceToNow(new Date(lastMessageAt), { 
                    addSuffix: false,
                    locale: fr 
                  })}
                </span>
              </div>
              <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                {lastMessage}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}