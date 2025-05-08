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

  // Gestion de l'upload
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

      const success = await addStory(profile.id, file, mediaType);
      if (success) {
        alert("Story ajoutée !");
        refreshStories();
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
  const handleAddStoryClick = () => {
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
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 relative">
            <div className={`w-full h-full rounded-full overflow-hidden bg-gray-200 ${hasStories ? 'border-2 border-red-500' : ''}`}>
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-2xl">{profile.firstName?.charAt(0)}</span>
                </div>
              )}
            </div>
            
            {currentProfileId === profile.id && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-red-500 text-white p-1 rounded-full"
                title="Ajouter une story"
                disabled={isUploading}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="ml-3">
            <h1 className="font-bold text-lg">{profile.nickname}</h1>
            <div className="flex text-sm text-gray-500">
              <span>{profile.firstName} {profile.lastName}</span>
              <span className="mx-1">•</span>
              <span>{followersCount} abonnés</span>
            </div>
          </div>
        </div>
        
        <div>
          {currentProfileId === profile.id ? (
            <button
              onClick={() => router.push('/profile/edit')}
              className="px-4 py-1 border border-gray-300 rounded-full text-sm font-medium hover:bg-gray-50"
            >
              Modifier le profil
            </button>
          ) : (
            <button
              onClick={onFollowToggle}
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                isFollowing
                  ? "bg-white text-black border border-gray-300"
                  : "bg-black text-white"
              }`}
            >
              {isFollowing ? "Ne plus suivre" : "Suivre"}
            </button>
          )}

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{profile.nickname}</h1>
                <p className="text-gray-600">
                  {profile.firstName} {profile.lastName}
                </p>
                {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                <p className="text-sm text-gray-500 mt-1">
                  Membre depuis{" "}
                  {formatDistance(new Date(profile.created_at), new Date(), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>

              <div className="flex">
                {/* Bouton pour éditer le profil (si c'est notre profil) */}
                {currentProfileId === profile.id && (
                  <button
                    onClick={() => router.push('/profile/edit')}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    Éditer le profil
                  </button>
                )}

                {/* Bouton suivre/ne plus suivre (si ce n'est pas notre profil) */}
                {currentProfileId !== profile.id && (
                  <button
                    onClick={onFollowToggle}
                    className={`px-4 py-2 rounded-full transition-colors ${
                      isFollowing
                        ? "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {isFollowing ? "Ne plus suivre" : "Suivre"}
                  </button>
                )}

                {/* Bouton Message (si ce n'est pas notre profil et qu'on peut s'envoyer des messages) */}
                {canMessage && profile.id !== currentProfileId && (
                  <button
                    onClick={() => router.push(`/messages/${profile.id}`)}
                    className="ml-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition"
                  >
                    Message
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex space-x-6 mt-4">
              <div>
                <span className="font-bold">{followersCount}</span>
                <span className="text-gray-600 ml-1">Abonnés</span>
              </div>
              <div>
                <span className="font-bold">{followingCount}</span>
                <span className="text-gray-600 ml-1">Abonnements</span>
              </div>
              <div>
                <span className="font-bold">{userStories.length}</span>
                <span className="text-gray-600 ml-1">Stories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3">
        {profile.bio || "Aucune bio"}
      </div>
      
      <div className="flex border-t border-gray-200 mt-4">
        <button className="flex-1 py-3 font-medium border-b-2 border-red-500">
          Posts
        </button>
        <button className="flex-1 py-3 text-gray-500">
          Réponses
        </button>
        <button className="flex-1 py-3 text-gray-500">
          Médias
        </button>
        <button className="flex-1 py-3 text-gray-500">
          J'aime
        </button>
      </div>
      
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
