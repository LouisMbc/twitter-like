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
      const mediaType = file.type.startsWith("image") ? "image" : "video";
      setIsUploading(true);

      // Vérifier que le profil actuel correspond à l'utilisateur authentifié
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || session.user.id !== profile.user_id) {
        throw new Error("Non autorisé");
      }

      console.log("USER_ID envoyé à Supabase:", profile.id);
      const success = await addStory(profile.id, file, mediaType);
      if (success) {
        alert("Story ajoutée !");
        refreshStories(); // Rafraîchir les stories après l'ajout
      } else {
        alert("Erreur lors de l'ajout de la story.");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la story");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStoryClick = () => {
    // Au lieu de rediriger vers une page dédiée
    // router.push("/stories");
    
    // Définir directement l'index de la story à afficher
    if (hasStories && userStories.length > 0) {
      setIsViewingStories(true);
      setCurrentStoryIndex(0);
    }
  };

  // Fonction pour ouvrir l'uploader de fichiers
  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
  return (
    <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 text-white overflow-hidden">
      {/* Enhanced Cover Image with gradient overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-indigo-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20 opacity-70"></div>
        <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-xl"></div>
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-8 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-16 right-16 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-12 left-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-white rounded-full animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="px-8 pb-8">
        {/* Profile Picture & Buttons */}
        <div className="flex justify-between items-start">
          {/* Enhanced Profile Picture */}
          <div 
            className="relative w-32 h-32 -mt-16 group"
            onClick={hasStories ? handleStoryClick : undefined}
          >
            {/* Glow effect for stories */}
            {hasStories && (
              <div className="absolute -inset-2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full blur-md opacity-75 animate-pulse"></div>
            )}
            
            {/* Story ring */}
            {hasStories && (
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-full p-1">
                <div className="bg-gray-900 rounded-full p-1">
                  {profile.profilePicture ? (
                    <img
                      src={profile.profilePicture}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      className="w-full h-full object-cover rounded-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-full flex items-center justify-center cursor-pointer transition-transform duration-300 group-hover:scale-105">
                      <span className="text-3xl font-bold text-white">
                        {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* No stories version */}
            {!hasStories && (
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur opacity-50"></div>
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    className="relative w-full h-full object-cover rounded-full border-4 border-gray-800 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-full border-4 border-gray-800 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <span className="text-3xl font-bold text-white">
                      {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Enhanced Add story button for current user */}
            {isCurrentUser(currentProfileId, profile.id) && (
              <button
                onClick={handleAddStoryClick}
                className="absolute bottom-2 right-2 group/add"
                disabled={isUploading}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur opacity-75 group-hover/add:opacity-100 transition duration-300"></div>
                <div className="relative bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-300 group-hover/add:scale-110">
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
            )}
          </div>
          
          {/* Enhanced Buttons */}
          <div className="mt-4 flex space-x-3">
            {canMessage && currentProfileId !== profile.id && (
              <button
                onClick={() => router.push(`/messages/${profile.id}`)}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                  </svg>
                  <span>Message</span>
                </div>
              </button>
            )}
            
            {isCurrentUser(currentProfileId, profile.id) ? (
              <button
                onClick={() => router.push('/profile/edit')}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300"></div>
                <div className="relative bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Modifier le profil</span>
                </div>
              </button>
            ) : (
              <button
                onClick={onFollowToggle}
                className="relative group"
              >
                <div className={`absolute -inset-0.5 rounded-full blur opacity-0 group-hover:opacity-75 transition duration-300 ${
                  isFollowing 
                    ? "bg-gradient-to-r from-gray-500 to-gray-600" 
                    : "bg-gradient-to-r from-red-500 to-pink-500"
                }`}></div>
                <div className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  isFollowing
                    ? "bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25"
                }`}>
                  {isFollowing ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6z" />
                      </svg>
                      <span>Ne plus suivre</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Suivre</span>
                    </>
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
        
        {/* Enhanced Profile Info */}
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {profile.nickname}
            </h1>
            <p className="text-lg text-gray-400">@{profile.nickname}</p>
          </div>
          
          {profile.bio && (
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <p className="text-gray-200 leading-relaxed text-lg">{profile.bio}</p>
            </div>
          )}
          
          <div className="flex items-center space-x-3 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Membre depuis {formatDistance(new Date(profile.created_at || new Date()), new Date(), { locale: fr, addSuffix: true })}</span>
          </div>
          
          <div className="flex space-x-8">
            <Link href="#following" className="group">
              <div className="bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {followingCount}
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Abonnements
                  </div>
                </div>
              </div>
            </Link>
            
            <Link href="#followers" className="group">
              <div className="bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                    {followersCount}
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Abonnés
                  </div>
                </div>
              </div>
            </Link>
            
            <div className="group">
              <div className="bg-gray-800/40 hover:bg-gray-700/60 rounded-xl p-4 transition-all duration-300 hover:transform hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                    {userStories.length}
                  </div>
                  <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Stories
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        {/* Story Viewer Modal */}
      {isViewingStories && (
        <div className="fixed inset-0 z-50">
          <Story 
            userId={profile.id} 
            initialStoryIndex={currentStoryIndex}
            onClose={() => setIsViewingStories(false)}
          />
        </div>
      )}
    </div>
  );
}

// Helper constant to match the prop check in the component
const isCurrentUser = (currentProfileId: string | null, profileId: string) => currentProfileId === profileId;
