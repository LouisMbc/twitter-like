// src/app/messages/[userId]/page.tsx
"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useMessages } from '@/hooks/useMessages';
import { useProfile } from '@/hooks/useProfile';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { profileService } from '@/services/supabase/profile';

export default function ConversationPage() {
  const { userId } = useParams();
  const { currentMessages, currentContact, loading, sendingMessage, error, fetchMessages, sendMessage, checkCanMessage } = useMessages();
  const { profile } = useProfile();
  const [message, setMessage] = useState('');
  const [canMessageUser, setCanMessageUser] = useState(true); // Défini par défaut à true
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  const messagesEndRef = useRef(null);

  // Debug pour voir les valeurs
  console.log("État actuel:", {
    userId,
    currentContact,
    profile,
    canMessageUser,
    currentMessagesLength: currentMessages?.length || 0
  });

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setCheckingPermissions(true);
        
        // Vérifier si l'ID est valide
        if (!userId || !profile) {
          console.log("userId ou profile manquant", { userId, profile });
          return;
        }
        
        console.log("Chargement du profil pour", userId);
        
        // Charger le profil de l'utilisateur
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
        
        // Vérifier les permissions de messagerie
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

  // Faire défiler vers le bas quand les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !canMessageUser) return;
    
    const success = await sendMessage(userId, message);
    if (success) {
      setMessage('');
    }
  };

  // Si le chargement est en cours, afficher un indicateur
  if (loading || checkingPermissions) {
    return <div className="p-4 text-center text-white bg-black">Chargement de la conversation...</div>;
  }

  // Si une erreur s'est produite, l'afficher
  if (error) {
    return <div className="p-4 text-red-500 bg-black">{error}</div>;
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-black">
        {/* En-tête */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 flex items-center">
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
            <div className="space-y-3">
              {currentMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender_id === profile?.id 
                        ? 'bg-red-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-white rounded-bl-none border border-gray-700'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${
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
          <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4 bg-black">
            <div className="flex">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrivez votre message..."
                className="flex-1 border border-gray-700 rounded-l-lg px-4 py-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={sendingMessage}
                autoFocus
              />
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-r-lg hover:bg-red-700 disabled:bg-gray-700"
                disabled={sendingMessage || !message.trim()}
              >
                Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}