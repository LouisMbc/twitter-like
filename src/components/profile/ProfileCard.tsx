// src/components/profile/ProfileCard.tsx
"use client";

import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ProfileCardProps {
  profile: {
    firstName: string;
    lastName: string;
    nickname: string;
    bio: string;
    profilePicture: string;
    created_at: string;
  };
  followersCount: number;
  followingCount: number;
}

export default function ProfileCard({ profile, followersCount, followingCount }: ProfileCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start space-x-6">
        {/* Photo de profil */}
        <div className="w-32 h-32 rounded-full overflow-hidden">
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-500">
                {profile.firstName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Informations du profil */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.nickname}</h1>
              <p className="text-gray-600">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Membre depuis {formatDistance(new Date(profile.created_at), new Date(), { locale: fr })}
              </p>
            </div>
            <button
              onClick={() => router.push('/profile/edit')}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200"
            >
              Éditer le profil
            </button>
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