// src/app/messages/[userId]/page.tsx
"use client";

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { profileService } from '@/services/supabase/profile';
import Sidebar from '@/components/layout/Sidebar';

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

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
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
        }
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

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        <div className="flex flex-col h-screen">
          {/* En-tête */}
          <div className="bg-black border-b border-gray-800 p-4 flex items-center">
            <Link href="/messages" className="mr-4 text-white hover:bg-gray-800 p-2 rounded-full">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            {currentContact && (
              <div className="flex items-center">
                <Image 
                  src={currentContact.profilePicture || '/default-avatar.png'} 
                  alt={currentContact.nickname} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
                <div className="ml-3">
                  <h2 className="font-semibold text-white">{currentContact.nickname}</h2>
                  <p className="text-xs text-gray-400">Viens tout seul</p>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-black">
            {!canMessageUser ? (
              <div className="text-center p-4 bg-gray-900 rounded-lg text-white border border-gray-800">
                <p>Vous ne pouvez pas échanger de messages avec cet utilisateur.</p>
                <p className="text-sm mt-2 text-gray-300">Vous devez vous suivre mutuellement pour pouvoir communiquer.</p>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="text-center p-4 text-gray-400">
                <p>Aucun message dans cette conversation.</p>
                <p className="text-sm mt-2">Envoyez le premier message pour commencer à discuter!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender_id !== profile?.id && (
                      <div className="mr-2">
                        <Image 
                          src={currentContact?.profilePicture || '/default-avatar.png'} 
                          alt={currentContact?.nickname || 'Contact'} 
                          width={32} 
                          height={32} 
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <div 
                      className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.sender_id === profile?.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-800 text-white border border-gray-700'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 text-right ${
                        msg.sender_id === profile?.id ? 'text-red-200' : 'text-gray-400'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Formulaire d'envoi */}
          {canMessageUser && (
            <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-3 bg-black">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Démarrer la conversation..."
                  className="flex-1 border border-gray-700 rounded-full px-4 py-2 bg-gray-900 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  disabled={sendingMessage}
                  autoFocus
                />
                <button
                  type="submit"
                  className="ml-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:bg-gray-700 disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                  disabled={sendingMessage || !message.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}