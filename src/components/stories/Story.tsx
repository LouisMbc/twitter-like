// src/components/stories/Story.tsx
"use client";

import { useStories } from "@/hooks/useStories";
import { useState, useEffect, useCallback } from "react";
import { Suspense } from 'react';
import StoryMedia from './StoryMedia';
import StoryActions from './StoryActions';
import supabase from '@/lib/supabase-browser';

const STORY_DURATION = 60; // Durée en secondes (1 minute)

const Story = ({ 
  userId, 
  initialStoryIndex = 0,
  onClose 
}: { 
  userId?: string | null;
  initialStoryIndex?: number;
  onClose?: () => void;
}) => {
  const { stories, loading, refreshStories } = useStories();
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(STORY_DURATION);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Déterminer si nous sommes côté client
  useEffect(() => {
    setIsClient(true);
    // Initialiser l'index seulement côté client pour éviter l'erreur d'hydration
    setCurrentStoryIndex(initialStoryIndex !== undefined ? initialStoryIndex : null);
  }, [initialStoryIndex]);
  
  // Filtrer les stories si un userId est fourni
  const filteredStories = userId 
    ? stories.filter(story => story.user_id === userId)
    : stories;
  
  // Obtenir la story actuelle
  const currentStory = currentStoryIndex !== null ? filteredStories[currentStoryIndex] : null;

  // Vérifier si l'utilisateur actuel est le propriétaire de la story
  useEffect(() => {
    // Ne pas exécuter cette vérification côté serveur
    if (!isClient) return;
    
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
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
    }
  }, [currentStoryIndex, filteredStories.length]);

  // Fonction pour passer à la story précédente
  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex === null || currentStoryIndex === 0) return;
    
    setCurrentStoryIndex(currentStoryIndex - 1);
    setTimeRemaining(STORY_DURATION);
  }, [currentStoryIndex]);

  // Ajoutez un gestionnaire pour le bouton de fermeture
  const handleClose = () => {
    setCurrentStoryIndex(null);
    if (onClose) onClose();
  };

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

  // Fonction pour gérer la suppression
  const handleStoryDeleted = () => {
    if (currentStoryIndex !== null) {
      // Si c'était la dernière story, fermer la vue
      if (filteredStories.length <= 1) {
        setCurrentStoryIndex(null);
      } 
      // Sinon passer à la story suivante ou revenir à la précédente
      else if (currentStoryIndex >= filteredStories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex - 1);
      }
      
      refreshStories(); // Recharger la liste des stories
    }
  };

  // Ne rien afficher si on n'est pas encore côté client pour éviter l'erreur d'hydration
  if (!isClient) {
    return null;
  }

  if (loading) return <p>Chargement...</p>;
  
  return (
    <>
      <div className="flex space-x-4 overflow-x-auto p-2 scrollbar-hide">
        {filteredStories.map((story, index) => (
          <div
            key={story.id}
            className="flex-shrink-0 relative group cursor-pointer"
            onClick={() => {
              setCurrentStoryIndex(index);
              setTimeRemaining(STORY_DURATION);
            }}
          >
            {/* Container avec effet de bordure */}
            <div className="relative">
              {/* Bordure animée */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-900 flex items-center justify-center">
                {story.Profile?.profilePicture ? (
                  <img 
                    src={story.Profile.profilePicture} 
                    alt={story.Profile.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {story.Profile?.nickname?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
            
            {/* Nom d'utilisateur */}
            <p className="text-xs text-gray-300 text-center mt-2 truncate max-w-16">
              {story.Profile?.nickname || 'User'}
            </p>
            
            {/* Indicateur de temps restant */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Affichage en plein écran de la Story sélectionnée */}
      {currentStory && (
        <div
          className="fixed inset-0 w-full h-full bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999] story-container"
          style={{ zIndex: 9999 }}
          onClick={handleClose} // Fermer en cliquant sur l'arrière-plan
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {currentStory.Profile?.profilePicture ? (
                  <img 
                    src={currentStory.Profile.profilePicture} 
                    alt={currentStory.Profile.nickname}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  currentStory.Profile?.nickname?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {currentStory.Profile?.nickname || 'Utilisateur'}
                </p>
                <p className="text-gray-300 text-xs">
                  {new Date(currentStory.created_at || '').toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Bouton fermer */}
            <button 
              className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="w-full h-full max-w-md mx-auto flex items-center justify-center p-6 pt-24 pb-16"
            onClick={(e) => e.stopPropagation()} // Empêcher la fermeture en cliquant sur le contenu
          >
            <div className="w-full h-full max-h-[70vh] rounded-2xl overflow-hidden bg-gray-900/50 backdrop-blur-sm border border-gray-700/30">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
                  </div>
                </div>
              }>
                <StoryMedia storyId={currentStory.id} />
              </Suspense>
            </div>
          </div>

          {/* Actions de la story (pour le propriétaire) */}
          {currentStory && currentUserId === currentStory.user_id && (
            <div className="absolute bottom-6 left-6 right-6 z-[10000]" onClick={(e) => e.stopPropagation()}>
              <StoryActions 
                storyId={currentStory.id || ''} 
                mediaUrl={currentStory.media_url || ''}
                onDelete={handleStoryDeleted}
              />
            </div>
          )}

          {/* Indicateur de position */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1 z-[10000]">
            {filteredStories.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentStoryIndex 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Story;