"use client";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Profile } from "@/types";
import { useState, useRef } from "react";
import { addStory } from "@/services/supabase/story";
import supabase from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { useStories } from "@/hooks/useStories";

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
  const { stories, refreshStories } = useStories();
  const isCurrentUser = currentProfileId === profile.id;

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

      const success = await addStory(profile.id, file, mediaType);
      if (success) {
        refreshStories();
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-black text-white">
      {/* Cover Image - Grey placeholder */}
      <div className="h-32 bg-gray-700 w-full"></div>
      
      <div className="px-4">
        {/* Profile Picture & Buttons */}
        <div className="flex justify-between items-start">
          {/* Profile Picture */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-black -mt-12 relative">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white">
                <span className="text-2xl font-bold">
                  {profile.firstName?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                </span>
              </div>
            )}
            
            {/* Story indicator ring */}
            {hasStories && (
              <div className="absolute inset-0 border-2 border-red-500 rounded-full pointer-events-none"></div>
            )}
            
            {/* Add story button for current user */}
            {isCurrentUser && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                disabled={isUploading}
              >
                <span className="text-xs">+</span>
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
          <div className="mt-2">
            {isCurrentUser ? (
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
          <h1 className="text-xl font-bold">{profile.nickname || profile.username}</h1>
          <p className="text-gray-500 text-sm">@{profile.username || profile.nickname}</p>
          
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
          </div>
        </div>
      </div>
    </div>
  );
}
