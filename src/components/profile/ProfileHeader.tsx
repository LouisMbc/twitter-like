"use client";

import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Profile } from '@/types';

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
  onFollowToggle
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start space-x-6">
        {/* Avatar */}
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

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{profile.nickname}</h1>
              <p className="text-gray-600">
                {profile.firstName} {profile.lastName}
              </p>
              {profile.bio && (
                <p className="text-gray-700 mt-2">{profile.bio}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Membre depuis {formatDistance(new Date(profile.created_at), new Date(), { 
                  addSuffix: true,
                  locale: fr 
                })}
              </p>
            </div>

            {currentProfileId !== profile.id && (
              <button
                onClick={onFollowToggle}
                className={`px-4 py-2 rounded-full transition-colors ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isFollowing ? 'Ne plus suivre' : 'Suivre'}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex space-x-6 mt-4">
            <div className="text-center">
              <span className="font-bold">{followersCount}</span>
              <span className="text-gray-600 ml-1">Abonnés</span>
            </div>
            <div className="text-center">
              <span className="font-bold">{followingCount}</span>
              <span className="text-gray-600 ml-1">Abonnements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}