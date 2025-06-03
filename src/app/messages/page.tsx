// src/app/messages/page.tsx
"use client";

import { useProfile } from '@/hooks/useProfile';
import { useMessages } from '@/hooks/useMessages';
import ConversationList from '@/components/messages/ConversationList';
import { MagnifyingGlassIcon, PencilSquareIcon, Cog6ToothIcon, InboxIcon, ArrowLeftIcon, InformationCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Header from '@/components/shared/Header';
import { useState, useRef, useEffect, FormEvent } from 'react';
import { profileService } from '@/services/supabase/profile';
import supabase from '@/lib/supabase';

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

export default function MessagesPage() {
  const { profile, loading } = useProfile();
  const { currentMessages, currentContact, loading: messagesLoading, sendingMessage, error, fetchMessages, sendMessage, checkCanMessage } = useMessages() as {
    currentMessages: MessageType[];
    currentContact: ContactType | null;
    loading: boolean;
    sendingMessage: boolean;
    error: string | null;
    fetchMessages: (contact: any) => void;
    sendMessage: (userId: string, content: string) => Promise<boolean>;
    checkCanMessage: (userId: string) => Promise<boolean>;
  };
  const router = useRouter();
  
  // États pour la conversation active
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [canMessageUser, setCanMessageUser] = useState(true);
  const [checkingPermissions, setCheckingPermissions] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [followings, setFollowings] = useState<ContactType[]>([]);
  const [loadingFollowings, setLoadingFollowings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fonction pour charger les abonnements
  const loadFollowings = async () => {
    if (!profile?.id) {
      console.log('Pas de profil trouvé:', profile);
      return;
    }
    
    console.log('Chargement des abonnements pour le profil:', profile.id);
    setLoadingFollowings(true);
    
    try {
      // Récupérer les abonnements directement depuis la table follows
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', profile.id);
      
      console.log('Résultat de la requête follows:', { followsData, followsError });
      
      if (followsError) {
        console.error('Erreur lors du chargement des abonnements:', followsError);
        return;
      }
      
      if (followsData && followsData.length > 0) {
        console.log('Abonnements bruts trouvés:', followsData);
        
        // Récupérer les profils des utilisateurs suivis
        const followingIds = followsData.map(follow => follow.following_id);
        console.log('IDs des utilisateurs suivis:', followingIds);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', followingIds);
        
        console.log('Résultat de la requête profiles:', { profilesData, profilesError });
        
        if (profilesError) {
          console.error('Erreur lors du chargement des profils:', profilesError);
          return;
        }
        
        if (profilesData) {
          const followingsWithProfiles = profilesData.map(profile => ({
            id: profile.id,
            nickname: profile.nickname || profile.name || profile.username || 'Utilisateur',
            profilePicture: profile.profilePicture || profile.profile_picture || profile.avatar_url
          }));
          
          console.log('Abonnements formatés:', followingsWithProfiles);
          setFollowings(followingsWithProfiles);
        }
      } else {
        console.log('Aucun abonnement trouvé dans la base de données');
        setFollowings([]);
      }
    } catch (error) {
      console.error('Erreur générale:', error);
      setFollowings([]);
    } finally {
      setLoadingFollowings(false);
    }
  };

  // Ouvrir le modal et charger les abonnements
  const handleNewMessage = () => {
    setShowNewMessageModal(true);
    loadFollowings();
  };

  // Sélectionner un abonné pour démarrer une conversation
  const handleSelectFollowing = async (userId: string) => {
    setShowNewMessageModal(false);
    setSearchQuery('');
    await handleSelectConversation(userId);
  };

  // Filtrer les abonnements selon la recherche
  const filteredFollowings = followings.filter(following =>
    following.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fonction pour sélectionner une conversation
  const handleSelectConversation = async (userId: string) => {
    try {
      setSelectedUserId(userId);
      setCheckingPermissions(true);
      
      console.log("Chargement du profil pour", userId);
      
      const { data, error } = await profileService.getProfileById(userId);
      
      if (error) {
        console.error("Erreur lors du chargement du profil:", error);
        return;
      }
      
      if (data) {
        console.log("Profil chargé:", data);
        fetchMessages(data);
      }
      
      const canMessage = await checkCanMessage(userId);
      setCanMessageUser(canMessage);
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
    } finally {
      setCheckingPermissions(false);
    }
  };

  // Fonction pour envoyer un message
  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || !selectedUserId) return;
    
    // Vérifier si l'utilisateur peut envoyer un message (abonnement mutuel)
    const canMessage = await checkCanMessage(selectedUserId);
    if (!canMessage) {
      console.error("Impossible d'envoyer un message : abonnement mutuel requis");
      return;
    }
    
    const success = await sendMessage(selectedUserId, message);
    if (success) {
      setMessage('');
    }
  };

  // Scroll automatique vers le dernier message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Accès non autorisé</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à vos messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-gray-50 relative overflow-hidden transition-colors duration-300">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100/30 dark:from-gray-950/30 via-transparent to-gray-100/30 dark:to-gray-950/30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/4 dark:bg-gray-900/4 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/3 dark:bg-gray-800/3 rounded-full blur-3xl"></div>

      <Header />

      {/* Main content */}
      <div className="ml-64 flex-1 relative z-10 flex">
        {/* Left Panel - Conversations */}
        <div className="w-80 border-r border-gray-200/50 dark:border-gray-800/50 flex flex-col h-screen">
          {/* Header Messages sans bouton thème */}
          <div className="sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 p-4 flex items-center justify-between transition-colors duration-300">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-full transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 rounded-full transition-colors">
                <PencilSquareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher des messages"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700/50 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto">
            <ConversationList onSelectConversation={handleSelectConversation} selectedUserId={selectedUserId} />
          </div>
        </div>

        {/* Right Panel - Message Area */}
        <div className="flex-1 flex flex-col bg-gray-950/40">
          {selectedUserId && currentContact ? (
            <>
              {/* Conversation header */}
              <div className="bg-gray-950/80 backdrop-blur-sm border-b border-gray-800/50 p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    onClick={() => setSelectedUserId(null)}
                    className="mr-4 text-gray-400 hover:bg-gray-800/50 p-2 rounded-full transition-colors lg:hidden"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
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
                </div>
                <button className="p-2 hover:bg-gray-800/50 rounded-full transition-colors">
                  <InformationCircleIcon className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4">
                {checkingPermissions || messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                      <div className="mt-4">Chargement de la conversation...</div>
                    </div>
                  </div>
                ) : !canMessageUser ? (
                  <div className="text-center p-8">
                    <div className="bg-gray-900/60 rounded-xl p-6 border border-gray-800/50">
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
                    {currentMessages.map((msg) => (
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
                <div className="border-t border-gray-800/50 p-4 bg-gray-950/80 backdrop-blur-sm">
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
                      type="submit"
                      className={`p-3 rounded-full transition-all duration-200 ${
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
            </>          ) : (
            /* État par défaut - Sélectionner un message */
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md px-8">
                <div className="mb-8">
                  {/* Icône de message avec style similaire à l'image */}
                  <div className="w-20 h-20 bg-gray-800/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-700/30">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-white">
                  Sélectionnez un message.
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed text-sm">
                  Faites un choix dans vos conversations existantes, commencez-en une nouvelle ou ne changez rien.
                </p>
                
                <button 
                  onClick={handleNewMessage}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors text-sm"
                >
                  Nouveau message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouveau Message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
              <h3 className="text-xl font-bold text-white">Nouveau message</h3>
              <button
                onClick={() => {
                  setShowNewMessageModal(false);
                  setSearchQuery('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="p-4 border-b border-gray-700/50">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un abonnement"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/60 border border-gray-600/50 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                />
              </div>
            </div>

            {/* Liste des abonnements */}
            <div className="flex-1 overflow-y-auto">
              {loadingFollowings ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : filteredFollowings.length === 0 ? (
                <div className="text-center p-8">
                  <div className="mb-4">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">
                    {searchQuery ? 'Aucun abonnement trouvé' : 'Vous ne suivez personne encore'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredFollowings.map((following) => (
                    <button
                      key={following.id}
                      onClick={() => handleSelectFollowing(following.id)}
                      className="w-full flex items-center p-3 hover:bg-gray-800/50 rounded-xl transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 mr-3 flex-shrink-0">
                        {following.profilePicture ? (
                          <img
                            src={following.profilePicture}
                            alt={following.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-medium">
                            {following.nickname.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{following.nickname}</p>
                        <p className="text-sm text-gray-400">Démarrer une conversation</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}