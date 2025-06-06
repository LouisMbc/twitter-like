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

  return (
    <>
      <div className="bg-black border-b border-gray-800 w-full">
        {/* Simple Cover area */}
        <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-700 w-full"></div>
        
        <div className="px-8 pb-6 max-w-6xl mx-auto">
          {/* Profile section */}
          <div className="flex items-end justify-between -mt-20">
            {/* Profile Picture - Simplifié */}
            <div className="relative">
              <div 
                className="relative group cursor-pointer"
                onClick={hasStories ? handleStoryClick : undefined}
              >
                {/* Story ring simple */}
                {hasStories && (
                  <div className="absolutew -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-1">
                    <div className="bg-black rounded-full p-1">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt={profile.nickname || ''}
                          className="w-32 h-32 object-cover rounded-full cursor-pointer border-2 border-black"
                        />
                      ) : (
                        <div className="w-32 h-32 bg-gray-600 rounded-full flex items-center justify-center cursor-pointer border-2 border-black">
                          <span className="text-2xl font-bold text-white">
                            {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* No stories version */}
                {!hasStories && (
                  <>
                    {profile.profilePicture ? (
                      <img
                        src={profile.profilePicture}
                        alt={profile.nickname || ''}
                        className="w-32 h-32 object-cover rounded-full border-4 border-black shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-600 rounded-full border-4 border-black shadow-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Add story button simple */}
              {isCurrentUser(currentProfileId, profile.id) && (
                <button
                  onClick={handleAddStoryClick}
                  className="absolute bottom-2 right-2 group/add z-10"
                  disabled={isUploading}
                  type="button"
                >
                  <div className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors duration-300 border-2 border-black">
                    {isUploading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            
            {/* Action Button simple */}
            <div className="mb-6">
              {isCurrentUser(currentProfileId, profile.id) ? (
                <button
                  onClick={handleEditProfile}
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full text-base font-medium border border-red-500 transition-colors"
                >
                  Modifier le profil
                </button>
              ) : (
                <div className="flex space-x-3">
                  {canMessage && (
                    <button
                      onClick={() => router.push(`/messages/${profile.id}`)}
                      className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-full text-base font-medium border border-gray-700 transition-colors"
                    >
                      Message
                    </button>
                  )}
                  <button
                    onClick={onFollowToggle}
                    className={`px-6 py-3 rounded-full text-base font-medium transition-colors ${
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
          
          {/* Profile Info simplifié */}
          <div className="mt-6">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-white">{profile.nickname}</h1>
              {hasStories && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-red-400">Stories actives</span>
                </div>
              )}
              {profile.certified && (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />                </svg>              )}
            </div>
            
            {profile.bio && (
              <div className="bg-gray-800/30 rounded-xl p-4 mt-4 border border-gray-700/50">
                <p className="text-gray-200 leading-relaxed text-lg">{profile.bio}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mt-4 text-base text-gray-500">
              <span>Membre depuis {formatDistance(new Date(profile.created_at || new Date()), new Date(), { locale: fr, addSuffix: true })}</span>
            </div>
            
            {/* Stats simples */}
            <div className="flex space-x-6 mt-6">
              <Link href="#following" className="hover:text-gray-300 transition-colors">
                <span className="font-bold text-white text-xl">{followingCount}</span>
                <span className="text-gray-400 ml-2 text-base">Abonnements</span>
              </Link>
              
              <Link href="#followers" className="hover:text-gray-300 transition-colors">
                <span className="font-bold text-white text-xl">{followersCount}</span>
                <span className="text-gray-400 ml-2 text-base">Abonnés</span>
              </Link>
              
              {hasStories && (
                <div className="cursor-pointer hover:text-gray-300 transition-colors" onClick={handleStoryClick}>
                  <span className="font-bold text-white text-xl">{userStories.length}</span>
                  <span className="text-gray-400 ml-2 text-base">Stories</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Story Viewer Modal */}
      {isViewingStories && (
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
            onClose={() => {
              setIsViewingStories(false);
              setCurrentStoryIndex(0);
            }}
          />
        </div>
      )}
    </>
  );
}

const isCurrentUser = (currentProfileId: string | null, profileId: string) => currentProfileId === profileId;
