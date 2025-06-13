// src/components/profile/ProfileCard.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import supabase from '@/lib/supabase';
import { notificationService } from '@/services/supabase/notification';
import Image from 'next/image';

interface ProfileCardProps {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    nickname: string;
    bio: string;
    profilePicture: string;
    created_at: string;
  };
  followersCount: number;
  followingCount: number;
  onFollowingChange: (change: number) => void;
  isCurrentUser?: boolean; // Est-ce le profil de l'utilisateur connecté?
}

export default function ProfileCard({ 
  profile, 
  followersCount, 
  followingCount, 
  onFollowingChange,
  isCurrentUser = true // Par défaut, on considère que c'est le profil de l'utilisateur courant
}: ProfileCardProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localFollowingCount, setLocalFollowingCount] = useState(followingCount);

  // Synchroniser le compteur local avec la prop
  useEffect(() => {
    setLocalFollowingCount(followingCount);
  }, [followingCount]);

  // Vérifier si l'utilisateur suit déjà ce profil
  useEffect(() => {
    const checkIsFollowing = async () => {
      if (isCurrentUser) return; // Ne pas vérifier si c'est le profil de l'utilisateur courant
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data: profileData } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (!profileData) return;
        
        const { data, error } = await supabase
          .from('Following')
          .select('id')
          .eq('follower_id', profileData.id)
          .eq('following_id', profile.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        setIsFollowing(!!data);
      } catch {
      }
    };
    
    checkIsFollowing();
  }, [profile.id, isCurrentUser]);

  // Implémentation directe sans dépendre d'un service externe
  const handleFollowToggle = async () => {
    if (isCurrentUser) return; // Ne pas permettre de se suivre soi-même
    
    try {
      setLoading(true);
      
      // Récupérer l'ID du profil de l'utilisateur connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      // Récupérer l'ID du profil
      const { data: profileData } = await supabase
        .from('Profile')
        .select('id, following_count')
        .eq('user_id', session.user.id)
        .single();
      
      if (!profileData) {
        return;
      }
      
      if (isFollowing) {
        // Se désabonner
        const { error } = await supabase
          .from('Following')
          .delete()
          .eq('follower_id', profileData.id)
          .eq('following_id', profile.id);
        
        if (error) throw error;
        
        setIsFollowing(false);
        // Mettre à jour le compteur local
        setLocalFollowingCount(prev => Math.max(0, prev - 1));
        onFollowingChange(-1); // Décrémenter le compteur dans le parent
        
        // Force refresh du compteur dans la base de données (au cas où le trigger n'aurait pas fonctionné)
        await supabase
          .from('Profile')
          .update({ following_count: Math.max(0, profileData.following_count - 1) })
          .eq('id', profileData.id);
      } else {
        // S'abonner
        const { error } = await supabase
          .from('Following')
          .insert([
            { follower_id: profileData.id, following_id: profile.id }
          ]);
        
        if (error) throw error;
        
        setIsFollowing(true);
        // Mettre à jour le compteur local
        setLocalFollowingCount(prev => prev + 1);
        onFollowingChange(1); // Incrémenter le compteur dans le parent
        
        // Créer une notification de suivi
        await notificationService.createFollowNotification(profile.id, profileData.id);
        
        // Force refresh du compteur dans la base de données (au cas où le trigger n'aurait pas fonctionné)
        await supabase
          .from('Profile')
          .update({ following_count: profileData.following_count + 1 })
          .eq('id', profileData.id);
      }
      
      // Force refresh de la page pour récupérer les données à jour
      router.refresh();
      
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  return (
    <div className="bg-black border border-gray-800 rounded-lg p-8 mb-8 w-full">
      <div className="flex items-start space-x-8">
        {/* Photo de profil - larger */}
        <div className="w-40 h-40 rounded-full overflow-hidden">
          {profile.profilePicture ? (
            <Image
              src={profile.profilePicture}
              alt={profile.nickname}
              width={160}
              height={160}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-5xl text-gray-300">
                {profile.firstName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Informations du profil - expanded */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{profile.nickname}</h1>
              <p className="text-gray-400 text-lg">
                @{profile.nickname.toLowerCase()}
              </p>
              <p className="text-base text-gray-500 mt-2">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-base text-gray-500 mt-2">
                Membre depuis {formatDistance(new Date(profile.created_at), new Date(), { locale: fr })}
              </p>
            </div>
            
            {isCurrentUser ? (
              <button
                onClick={handleEditProfile}
                type="button"
                className="bg-gray-800 text-white px-4 py-2 rounded-full hover:bg-gray-700"
              >
                Éditer le profil
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={loading}
                className={`px-4 py-2 rounded-full transition ${
                  isFollowing 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading ? 'Chargement...' : isFollowing ? 'Ne plus suivre' : 'Suivre'}
              </button>
            )}
          </div>

          {/* Stats - larger */}
          <div className="flex space-x-8 mt-6">
            <div>
              <span className="font-bold text-white text-xl">{followersCount}</span>
              <span className="text-gray-400 ml-2 text-base">Abonnés</span>
            </div>
            <div>
              <span className="font-bold text-white text-xl">{localFollowingCount}</span>
              <span className="text-gray-400 ml-2 text-base">Abonnements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}