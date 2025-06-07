"use client";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Profile } from "@/types";
import { useState, useRef, useEffect } from "react";
import { addStory } from "@/services/supabase/story";
import supabase from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useStories } from "@/hooks/useStories";
import Story from "@/components/stories/Story";
import { messageService } from '@/services/supabase/message';

interface ProfileHeaderProps {
  profile: Profile;
  followersCount: number;
  followingCount: number;
  currentProfileId: string | null;
  isFollowing: boolean;
  onFollowToggle: () => void;
}

export default function ProfileHeader({
  profile,
  followersCount,
  followingCount,
  currentProfileId,
  isFollowing,
  onFollowToggle,
}: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { stories, loading: storiesLoading, refreshStories } = useStories();
  const [isViewingStories, setIsViewingStories] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [canMessage, setCanMessage] = useState(false);
  
  // Filtrer les stories du profil actuel
  const userStories = stories.filter(story => story.user_id === profile.id);
  const hasStories = userStories.length > 0;

  // Gestion de l'upload de la story
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const mediaType = file.type.startsWith("image") ? "image" : "video";

      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== profile.user_id) {
        throw new Error("Non autorisé");
      }

      const success = await addStory(profile.id, file, mediaType);
      if (success) {
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Rafraîchir les stories sans redirection
        refreshStories();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStoryClick = () => {
    // Empêcher le clic si on est en train d'uploader
    if (isUploading) return;
    
    if (hasStories && userStories.length > 0) {
      setIsViewingStories(true);
      setCurrentStoryIndex(0);
    }
  };

  // Fonction pour ouvrir l'uploader de fichiers
  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isUploading) return;
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Ajout de la vérification pour la messagerie
  useEffect(() => {
    // Vérifier si l'utilisateur peut envoyer un message à ce profil
    const checkMessagingPermission = async () => {
      if (!currentProfileId || !profile.id || profile.id === currentProfileId) {
        return;
      }
      
      console.log("Vérification des permissions de messagerie");
      console.log("currentProfileId:", currentProfileId);
      console.log("profile.id:", profile.id);
      
      try {
        const { canMessage: canSendMessage, error } = await messageService.canMessage(currentProfileId, profile.id);
        console.log("Résultat canMessage:", canSendMessage, error);
        setCanMessage(canSendMessage);
      } catch (err) {
        console.error("Erreur lors de la vérification des permissions de messagerie:", err);
        setCanMessage(false);
      }
    };
    
    if (currentProfileId && profile.id) {
      checkMessagingPermission();
    }
  }, [currentProfileId, profile.id]);

  const handleEditProfile = () => {
    window.location.href = '/profile/edit';
  };

  // Fonction pour fermer les stories et nettoyer l'état
  const handleCloseStories = () => {
    setIsViewingStories(false);
    setCurrentStoryIndex(0);
  };

  return (
    <>
      <div className="bg-black w-full">
        {/* Photo de couverture */}
        <div className="h-48 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 w-full relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="px-6 pb-6 w-full">
          {/* Section profil repositionnée */}
          <div className="flex items-end justify-between -mt-20 mb-4">
            {/* Photo de profil corrigée */}
            <div className="relative">
              <div 
                className="relative group cursor-pointer"
                onClick={hasStories ? handleStoryClick : undefined}
              >
                {hasStories ? (
                  // Avec stories - bordure rouge
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-pink-500 p-1">
                    <div className="w-full h-full bg-black rounded-full p-1 flex items-center justify-center">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt={profile.nickname || ''}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Sans stories - photo normale
                  <div className="w-32 h-32 rounded-full bg-black border-4 border-black">
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={profile.nickname || ''}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Bouton ajout story */}
              {isCurrentUser(currentProfileId, profile.id) && (
                <button
                  onClick={handleAddStoryClick}
                  className="absolute bottom-2 right-2 group/add z-20"
                  disabled={isUploading}
                  type="button"
                >
                  <div className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors duration-300 border-2 border-black">
                    {isUploading ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                </button>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            
            {/* Bouton "Modifier le profil" - Fixed positioning */}
            <div className="flex items-end mb-4">
              {isCurrentUser(currentProfileId, profile.id) ? (
                <button
                  onClick={handleEditProfile}
                  type="button"
                  className="bg-transparent border-2 border-gray-500 hover:border-gray-400 text-white px-6 py-2 rounded-full font-medium hover:bg-gray-900/50 transition-all duration-200 backdrop-blur-sm"
                >
                  Modifier le profil
                </button>
              ) : (
                <div className="flex space-x-3">
                  {canMessage && (
                    <button
                      onClick={() => router.push(`/messages/${profile.id}`)}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-full font-medium border border-gray-700 transition-colors duration-200"
                    >
                      Message
                    </button>
                  )}
                  <button
                    onClick={onFollowToggle}
                    className={`px-6 py-2.5 rounded-full font-medium transition-colors duration-200 ${
                      isFollowing
                        ? "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                        : "bg-red-500 hover:bg-red-600 text-white border border-red-500"
                    }`}
                  >
                    {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Informations du profil */}
          <div className="w-full space-y-3">
            {/* Nom et pseudo */}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white">{profile.nickname || "Utilisateur"}</h1>
                {hasStories && (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-400">Stories actives</span>
                  </div>
                )}
              </div>
              <p className="text-gray-400 text-sm">@{profile.nickname?.toLowerCase() || "utilisateur"}</p>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="text-white text-sm leading-relaxed">{profile.bio}</p>
            )}
            
            {/* Date d'inscription */}
            <div className="flex items-center text-gray-400 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              A rejoint X en {new Date(profile.created_at || new Date()).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </div>

            {/* Statistiques */}
            <div className="flex space-x-4 pt-2">
              <Link href="#following" className="hover:underline transition-colors">
                <span className="font-bold text-white">{followingCount}</span>
                <span className="text-gray-400 ml-1">abonnements</span>
              </Link>
              
              <Link href="#followers" className="hover:underline transition-colors">
                <span className="font-bold text-white">{followersCount}</span>
                <span className="text-gray-400 ml-1">abonnés</span>
              </Link>

              {/* Stories - toujours visible pour l'utilisateur actuel */}
              {(hasStories || isCurrentUser(currentProfileId, profile.id)) && (
                <div 
                  className="cursor-pointer hover:underline transition-colors" 
                  onClick={hasStories ? handleStoryClick : undefined}
                >
                  <span className="font-bold text-white">{userStories.length || 1}</span>
                  <span className="text-gray-400 ml-1">stories</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Story Viewer Modal */}
      {isViewingStories && hasStories && (
        <div 
          className="fixed inset-0 z-[9999] bg-black"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999
          }}
        >
          <Story 
            userId={profile.id} 
            initialStoryIndex={currentStoryIndex}
            onClose={handleCloseStories}
            isFullScreen={true}
          />
        </div>
      )}
    </>
  );
}

const isCurrentUser = (currentProfileId: string | null, profileId: string) => currentProfileId === profileId;
