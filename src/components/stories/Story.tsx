// src/components/stories/Story.tsx
"use client";

import { useStories } from "@/hooks/useStories";
import { useState, useEffect, useCallback } from "react";
import { Suspense } from 'react';
import StoryMedia from './StoryMedia';
import StoryActions from './StoryActions';
import supabase from '@/lib/supabase-browser';
import LogoLoader from '@/components/loader/loader';
import Image from 'next/image';

const STORY_DURATION = 60; // Durée en secondes (1 minute)

const Story = ({ 
  userId, 
  initialStoryIndex,
  onClose,
  onStoryClick,
  isFullScreen = false
}: { 
  userId?: string | null;
  initialStoryIndex?: number;
  onClose?: () => void;
  onStoryClick?: (userId: string, storyIndex: number) => void;
  isFullScreen?: boolean;
}) => {
  const { stories, loading, refreshStories } = useStories();
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(STORY_DURATION);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Déterminer si nous sommes côté client
  useEffect(() => {
    setIsClient(true);
    // Si un index initial est fourni ET un userId, ouvrir automatiquement
    if (initialStoryIndex !== undefined && userId) {
      setCurrentStoryIndex(initialStoryIndex);
    }
  }, [initialStoryIndex, userId]);
  
  // Filtrer les stories si un userId est fourni
  const filteredStories = userId 
    ? stories.filter(story => story.user_id === userId)
    : stories;
  
  // Obtenir la story actuelle
  const currentStory = currentStoryIndex !== null ? filteredStories[currentStoryIndex] : null;

  // Grouper les stories par utilisateur pour l'affichage en liste
  const storiesByUser = stories.reduce((acc, story) => {
    const userId = story.user_id;
    if (!acc[userId]) {
      acc[userId] = [];
    }
    acc[userId].push(story);
    return acc;
  }, {} as Record<string, unknown[]>);

  // Vérifier si l'utilisateur actuel est le propriétaire de la story
  useEffect(() => {
    // Ne pas exécuter cette vérification côté serveur
    if (!isClient) return;
    
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Récupérer l'ID du profil utilisateur depuis la table Profile
        const { data: profile } = await supabase
          .from('Profile')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentUserId(profile.id);
        }
      }
    };
    
    checkCurrentUser();
  }, [isClient]);

  // Fonction pour passer à la story suivante
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex === null) return;
    
    if (currentStoryIndex < filteredStories.length - 1) {
      // Passer à la story suivante
      setCurrentStoryIndex(currentStoryIndex + 1);
      // Réinitialiser le timer
      setTimeRemaining(STORY_DURATION);
    } else {
      // Fermer la vue des stories si c'était la dernière
      setCurrentStoryIndex(null);
      // Fermer le modal automatiquement
      if (onClose) onClose();
    }
  }, [currentStoryIndex, filteredStories.length, onClose]);

  // Fonction pour passer à la story précédente
  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex === null || currentStoryIndex === 0) return;
    
    setCurrentStoryIndex(currentStoryIndex - 1);
    setTimeRemaining(STORY_DURATION);
  }, [currentStoryIndex]);

  // Ajoutez un gestionnaire pour le bouton de fermeture
  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setTimeRemaining(STORY_DURATION);
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Démarrer le timer lorsqu'une story est ouverte
  useEffect(() => {
    if (currentStory === null || !isClient) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Si le temps est écoulé, passer à la story suivante
          clearInterval(timer);
          goToNextStory();
          return STORY_DURATION;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [currentStory, goToNextStory, isClient]);

  // Gestion des touches clavier
  useEffect(() => {
    if (currentStory === null || !isClient) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowLeft':
          goToPrevStory();
          break;
        case 'ArrowRight':
          goToNextStory();
          break;
        case ' ': // Barre d'espace pour pause/reprendre
          e.preventDefault();
          // Vous pouvez implémenter une logique de pause ici si nécessaire
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStory, goToPrevStory, goToNextStory, handleClose, isClient]);

  const handleStoryDeleted = () => {
    if (currentStoryIndex !== null) {
      if (filteredStories.length <= 1) {
        setCurrentStoryIndex(null);
      } 
      else if (currentStoryIndex >= filteredStories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      }
      
      refreshStories();
    }
  };

  if (!isClient) {
    return null;
  }

  if (loading) return <LogoLoader size="small" />;
  
  return (
    <>
      {/* Affichage de la liste des stories (uniquement si pas en plein écran) */}
      {!isFullScreen && !currentStory && (
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
          {Object.entries(storiesByUser).map(([userId, userStories]) => {
            const firstStory = userStories[0];
            
            return (
              <div
                key={userId}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => {
                  if (onStoryClick) {
                    onStoryClick(userId, 0);
                  } else {
                    setCurrentStoryIndex(stories.findIndex(story => story.user_id === userId));
                    setTimeRemaining(STORY_DURATION);
                  }
                }}
              >
                {/* Container avec effet de bordure */}
                <div className="relative">
                  {/* Bordure animée */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Avatar */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-900 flex items-center justify-center">
                    {firstStory.Profile?.profilePicture ? (
                      <Image 
                        src={firstStory.Profile.profilePicture} 
                        alt={firstStory.Profile.nickname || 'Profile'}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {firstStory.Profile?.nickname?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Nom d'utilisateur */}
                <p className="text-xs text-gray-300 text-center mt-2 truncate max-w-16">
                  {firstStory.Profile?.nickname || 'User'}
                </p>
              </div>
            );
          })}
          
          {/* Message si aucune story */}
          {Object.keys(storiesByUser).length === 0 && (
            <div className="text-gray-400 text-sm">
              Aucune story disponible
            </div>
          )}
        </div>
      )}

      {/* Affichage en plein écran de la Story sélectionnée */}
      {(isFullScreen || currentStory) && userId && filteredStories.length > 0 && (
        <div
          className="w-full h-full flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Barre de progression */}
          <div className="absolute top-6 left-6 right-6 z-[10000]">
            <div className="bg-gray-600/50 h-1 w-full rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-white h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${((STORY_DURATION - timeRemaining) / STORY_DURATION) * 100}%` }}
              />
            </div>
          </div>

          {/* Header avec info utilisateur */}
          <div className="absolute top-8 left-6 right-6 flex items-center justify-between z-[10000]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                {filteredStories[0]?.Profile?.profilePicture ? (
                  <Image
                    src={filteredStories[0].Profile.profilePicture}
                    alt={filteredStories[0].Profile.nickname || 'Profile'}
                    width={40}
                    height={40}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm">
                    {filteredStories[currentStoryIndex || 0]?.Profile?.nickname?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {filteredStories[currentStoryIndex || 0]?.Profile?.nickname || 'Utilisateur'}
                </p>
                <p className="text-gray-300 text-xs">
                  {filteredStories[currentStoryIndex || 0] && new Date(filteredStories[currentStoryIndex || 0].created_at || '').toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Bouton fermer */}
            <button 
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              onClick={handleClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation précédent */}
          {currentStoryIndex !== null && currentStoryIndex > 0 && (
            <button 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-200 z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevStory();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Navigation suivant */}
          {currentStoryIndex !== null && currentStoryIndex < filteredStories.length - 1 && (
            <button 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all duration-200 z-[10000]"
              onClick={(e) => {
                e.stopPropagation();
                goToNextStory();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          
          {/* Contenu principal de la story */}
          <div 
            className="w-full h-full max-w-lg mx-auto flex items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full max-h-[80vh] rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-teal-900/20 backdrop-blur-sm shadow-2xl border border-gray-700/30 relative">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-teal-900">
                  <LogoLoader size="small" />
                </div>
              }>
                {filteredStories[currentStoryIndex || 0] && (
                  <StoryMedia storyId={filteredStories[currentStoryIndex || 0].id} />
                )}
              </Suspense>
            </div>
          </div>

          {/* Actions de la story (pour le propriétaire) */}
          {filteredStories[currentStoryIndex || 0] && currentUserId === filteredStories[currentStoryIndex || 0].user_id && (
            <div className="absolute bottom-6 left-6 right-6 z-[10000]" onClick={(e) => e.stopPropagation()}>
              <StoryActions 
                storyId={filteredStories[currentStoryIndex || 0].id || ''} 
                mediaUrl={filteredStories[currentStoryIndex || 0].media_url || ''}
                onDelete={handleStoryDeleted}
              />
            </div>
          )}

          {/* Indicateur de position */}
          {filteredStories.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 z-[10000]">
              {filteredStories.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === (currentStoryIndex || 0)
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Story;