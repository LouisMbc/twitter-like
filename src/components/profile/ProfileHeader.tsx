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
    <div className="bg-black text-white">
      {/* Cover Image - Grey placeholder */}
      <div className="h-32 bg-gray-700 w-full"></div>
      
      <div className="px-4">
        {/* Profile Picture & Buttons */}
        <div className="flex justify-between items-start">
          {/* Profile Picture */}
          <div 
            className="w-24 h-24 rounded-full overflow-hidden border-4 border-black -mt-12 relative"
            onClick={hasStories ? handleStoryClick : undefined}
          >
            {hasStories && (
              <div className="absolute inset-0 border-2 border-red-500 rounded-full pointer-events-none"></div>
            )}
            
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.firstName} ${profile.lastName}`}
                className={`w-full h-full object-cover ${hasStories ? 'cursor-pointer' : ''}`}
              />
            ) : (
              <div className={`w-full h-full bg-gray-600 flex items-center justify-center text-white ${hasStories ? 'cursor-pointer' : ''}`}>
                <span className="text-2xl font-bold">
                  {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                </span>
              </div>
            )}
            
            {/* Add story button for current user */}
            {isCurrentUser(currentProfileId, profile.id) && (
              <button
                onClick={handleAddStoryClick}
                className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-xs">+</span>
                )}
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
          
          {/* Buttons */}
          <div className="mt-2 flex space-x-2">
            {canMessage && currentProfileId !== profile.id && (
              <button
                onClick={() => router.push(`/messages/${profile.id}`)}
                className="border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mr-2"
              >
                Message
              </button>
            )}
            
            {isCurrentUser(currentProfileId, profile.id) ? (
              <button
                onClick={() => router.push('/profile/edit')}
                className="border border-gray-600 text-white px-4 py-1.5 rounded-full text-sm font-medium"
              >
                Modifier le profil
              </button>
            ) : (
              <button
                onClick={onFollowToggle}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  isFollowing
                    ? "bg-transparent border border-gray-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isFollowing ? "Ne plus suivre" : "Suivre"}
              </button>
            )}
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="mt-3">
          <h1 className="text-xl font-bold">{profile.nickname}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.nickname}</p>
          
          {profile.bio && (
            <p className="mt-2 text-white">{profile.bio}</p>
          )}
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>Membre depuis {formatDistance(new Date(profile.created_at || new Date()), new Date(), { locale: fr, addSuffix: true })}</span>
          </div>
          
          <div className="flex space-x-5 mt-3">
            <Link href="#following" className="text-sm">
              <span className="font-bold text-white">{followingCount}</span>{" "}
              <span className="text-gray-500">Abonnements</span>
            </Link>
            <Link href="#followers" className="text-sm">
              <span className="font-bold text-white">{followersCount}</span>{" "}
              <span className="text-gray-500">Abonnés</span>
            </Link>
            <div className="text-sm">
              <span className="font-bold text-white">{userStories.length}</span>{" "}
              <span className="text-gray-500">Stories</span>
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
