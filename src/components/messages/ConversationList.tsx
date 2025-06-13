// src/components/messages/ConversationList.tsx
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Image from 'next/image';

interface ConversationListProps {
  onSelectConversation: (userId: string) => void;
  selectedUserId: string | null;
}

export default function ConversationList({ onSelectConversation, selectedUserId }: ConversationListProps) {
  const { conversations, loading } = useMessages();

  if (loading) {
    return <div className="p-4 text-center">Chargement des conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Aucune conversation pour le moment. Commencez par suivre quelqu&apos;un pour pouvoir lui envoyer des messages.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation: any) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.otherUser.id)}
          className={`p-4 hover:bg-gray-50 cursor-pointer ${
            selectedUserId === conversation.otherUser.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            {conversation.otherUser.profilePicture ? (
              <Image
                src={conversation.otherUser.profilePicture}
                alt={conversation.otherUser.nickname}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="font-medium text-gray-700">
                  {conversation.otherUser.nickname.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {conversation.otherUser.nickname}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {conversation.lastMessage?.content || 'Nouvelle conversation'}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}