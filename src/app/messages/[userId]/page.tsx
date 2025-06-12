// src/app/messages/[userId]/page.tsx
"use client";

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import { ArrowLeftIcon, PaperAirplaneIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { profileService } from '@/services/supabase/profile';

interface ContactType {
  id: string;
  nickname: string;
  profilePicture?: string;
}

interface MessageType {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export default function ConversationPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { currentMessages, currentContact, loading, sendingMessage, error, fetchMessages, sendMessage, checkCanMessage } = useMessages() as {
    currentMessages: MessageType[];
    currentContact: ContactType | null;
    loading: boolean;
    sendingMessage: boolean;
    error: string | null;
    fetchMessages: (contact: any) => void;
    sendMessage: (userId: string, content: string) => Promise<boolean>;
    checkCanMessage: (userId: string) => Promise<boolean>;
  };
  const { profile } = useProfile();
  const [message, setMessage] = useState('');
  const [canMessageUser, setCanMessageUser] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

    userId,
    currentContact,
    profile,
    canMessageUser,
    currentMessagesLength: currentMessages?.length || 0
  });

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !canMessageUser) return;
    
    const success = await sendMessage(userId as string, message);
    if (success) {
      setMessage('');
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setCheckingPermissions(true);
        
        if (!userId || !profile) {
          return;
        }
        
        
        const { data, error } = await profileService.getProfileById(userId as string);
        
        if (error) {
          return;
        }
        
        if (data) {
          // Forcer le rechargement des messages
          await fetchMessages(data);
        } else {
        }
        
        const canMessage = await checkCanMessage(userId as string);
        setCanMessageUser(canMessage);
      } catch (err) {
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    if (profile && userId) {
      loadMessages();
    }
  }, [userId, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  if (loading || checkingPermissions) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <div className="mt-4">Chargement de la conversation...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-all duration-300">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 dark:from-gray-950/30 via-transparent to-gray-100/30 dark:to-gray-950/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/4 dark:bg-gray-900/4 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/3 dark:bg-gray-800/3 rounded-full blur-3xl"></div>
      
      <div className="flex flex-col h-screen relative z-10">
        {/* Conversation header */}
        <div className="bg-background/80 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center">            <button 
              onClick={() => router.push('/messages')}
              className="mr-4 text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            {currentContact && (
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 mr-3">
                  {currentContact.profilePicture ? (
                    <img
                      src={currentContact.profilePicture}
                      alt={currentContact.nickname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-medium">
                      {currentContact.nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>                <div>
                  <h2 className="font-semibold text-foreground">{currentContact.nickname}</h2>
                  <p className="text-xs text-muted-foreground">En ligne</p>
                </div>
              </div>
            )}          </div>          <button 
            onClick={() => router.push(`/profile/${userId}`)}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            title="Voir le profil"
          >
            <InformationCircleIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-background/40 transition-all duration-300">
          {!canMessageUser ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-8">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700/30">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m0 0V9a3 3 0 116 0v6z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Impossible d'envoyer des messages
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                  Vous devez vous suivre mutuellement pour pouvoir communiquer.
                </p>
              </div>
            </div>
          ) : currentMessages.length === 0 ? (
            /* État par défaut - Style similaire à "Sélectionnez un message" */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-8">
                <div className="mb-8">
                  {/* Icône de message avec style similaire à l'image */}
                  <div className="w-20 h-20 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700/30">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Aucun message.
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                  Commencez la conversation en envoyant le premier message à {currentContact?.nickname} !
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {currentMessages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start space-x-3 ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender_id !== profile?.id && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                        {currentContact?.profilePicture ? (
                          <img
                            src={currentContact.profilePicture}
                            alt={currentContact.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                            {currentContact?.nickname.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex flex-col ${msg.sender_id === profile?.id ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
                        msg.sender_id === profile?.id 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="break-words">{msg.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {new Date(msg.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                      })}
                    </p>
                  </div>

                  {msg.sender_id === profile?.id && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600">
                        {profile?.profilePicture ? (
                          <img
                            src={profile.profilePicture}
                            alt={profile.nickname || 'Profile'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xs font-medium">
                            {profile?.nickname?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message input */}
        {canMessageUser && (
          <div className="border-t border-border p-4 bg-background/80 backdrop-blur-sm transition-all duration-300">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="w-full px-4 py-3 bg-gray-900/60 border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none max-h-32"
                  disabled={sendingMessage}
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (message.trim()) {
                        handleSendMessage(e as any);
                      }
                    }
                  }}
                  style={{
                    height: 'auto',
                    minHeight: '48px'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
              </div>
              <button
                type="submit"                className={`p-3 rounded-full transition-all duration-200 ${
                  message.trim() && !sendingMessage
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={sendingMessage || !message.trim()}
              >
                {sendingMessage ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <PaperAirplaneIcon className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}