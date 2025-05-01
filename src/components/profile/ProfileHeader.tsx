"use client";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Profile } from "@/types";
import { useState, useRef } from "react";
import { addStory } from "@/services/supabase/story";
import supabase from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useStories } from "@/hooks/useStories";
import Story from "@/components/stories/Story";

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
