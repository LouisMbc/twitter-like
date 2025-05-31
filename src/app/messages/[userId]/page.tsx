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

  console.log("État actuel:", {
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
          console.log("userId ou profile manquant", { userId, profile });
          return;
        }
        
        console.log("Chargement du profil pour", userId);
        
        const { data, error } = await profileService.getProfileById(userId as string);
        
        if (error) {
          console.error("Erreur lors du chargement du profil:", error);
          return;
        }
        
        if (data) {
          console.log("Profil chargé:", data);
          fetchMessages(data);
        } else {
          console.log("Profil non trouvé pour ID:", userId);
        }
        
        console.log("Vérification des permissions de messagerie entre", profile.id, "et", userId);
        const canMessage = await checkCanMessage(userId as string);
        console.log("Résultat canMessage:", canMessage);
        setCanMessageUser(canMessage);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    if (profile && userId) {
      loadMessages();
    }
  }, [userId, profile, fetchMessages, checkCanMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  if (loading || checkingPermissions) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <div className="mt-4">Chargement de la conversation...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Conversation header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center">
            <button 
              onClick={() => router.push('/messages')}
              className="mr-4 text-gray-400 hover:bg-gray-800 p-2 rounded-full transition-colors"
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
                </div>
                <div>
                  <h2 className="font-semibold text-white">{currentContact.nickname}</h2>
                  <p className="text-xs text-gray-400">En ligne</p>
                </div>
              </div>
            )}
          </div>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <InformationCircleIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
          {!canMessageUser ? (
            <div className="text-center p-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
                <div className="mb-4">
                  <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m0 0v2m0-2h2m-2 0H10m0 0V9a3 3 0 116 0v6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Impossible d'envoyer des messages</h3>
                <p className="text-gray-400">Vous devez vous suivre mutuellement pour pouvoir communiquer.</p>
              </div>
            </div>
          ) : currentMessages.length === 0 ? (
            <div className="text-center p-8">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Aucun message</h3>
              <p className="text-gray-400 mb-4">
                Commencez la conversation en envoyant le premier message !
              </p>
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
          <div className="border-t border-gray-700 p-4 bg-gray-900">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none max-h-32"
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
                type="submit"
                className={`p-3 rounded-full transition-all duration-200 ${
                  message.trim() && !sendingMessage
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
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