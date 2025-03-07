"use client";

import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Profile } from "@/types";
import { useState, useRef } from "react";
import { addStory } from "@/services/supabase/story";
import Story from "@/components/stories/Story";
import supabase from "@/lib/supabase";
import { useRouter } from 'next/navigation';

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

      console.log("USER_ID envoyé à Supabase:", profile.id);
      const success = await addStory(profile.id, file, mediaType);
      if (success) {
        alert("Story ajoutée !");
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
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start space-x-6">
        {/* Avatar avec bouton d'ajout de story */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl text-gray-500">
                  {profile.firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          {currentProfileId === profile.id && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full text-white flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isUploading ? "⏳" : "+"}
              </button>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

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

            <div>
              {/* Bouton pour éditer le profil si c'est le profil de l'utilisateur courant */}
              {currentProfileId === profile.id && (
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Éditer le profil
                </button>
              )}
              
              {/* Bouton suivre/ne plus suivre si ce n'est pas le profil de l'utilisateur courant */}
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
          </div>
        </div>
      </div>
    </div>
  );
}
