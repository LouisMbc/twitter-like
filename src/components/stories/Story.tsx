// src/components/stories/Story.tsx
"use client";

import { useStories } from "@/hooks/useStories";
import { useState, useEffect, useCallback } from "react";
import { Suspense } from 'react';
import StoryMedia from './StoryMedia';
import StoryActions from './StoryActions';
import supabase from '@/lib/supabase';

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
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(
    initialStoryIndex !== undefined ? initialStoryIndex : null
  );
  const [timeRemaining, setTimeRemaining] = useState(STORY_DURATION);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Filtrer les stories si un userId est fourni
  const filteredStories = userId 
    ? stories.filter(story => story.user_id === userId)
    : stories;
  
  // Obtenir la story actuelle
  const currentStory = currentStoryIndex !== null ? filteredStories[currentStoryIndex] : null;

  // Vérifier si l'utilisateur actuel est le propriétaire de la story
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    
    checkCurrentUser();
  }, []);

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

  // Démarrer le timer lorsqu'une story est ouverte
  useEffect(() => {
    if (currentStory === null) return;
    
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
  }, [currentStory, goToNextStory]);

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

  // Ajoutez un gestionnaire pour le bouton de fermeture
  const handleClose = () => {
    setCurrentStoryIndex(null);
    if (onClose) onClose();
  };

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex space-x-3 overflow-x-auto p-4 bg-gray-900 rounded-lg">
      {filteredStories.map((story, index) => (
        <div
          key={story.id}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500 cursor-pointer"
          onClick={() => {
            setCurrentStoryIndex(index);
            setTimeRemaining(STORY_DURATION);
          }}
        >
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
            {story.Profile?.nickname?.charAt(0).toUpperCase()}
          </div>
        </div>
      ))}

      {/* Affichage en plein écran de la Story sélectionnée */}
      {currentStory !== null && (
        <div
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-50"
        >
          {/* Barre de progression */}
          <div className="absolute top-4 left-0 right-0 px-4">
            <div className="bg-gray-600 h-1 w-full rounded-full overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-1000 ease-linear" 
                style={{ width: `${(timeRemaining / STORY_DURATION) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Bouton précédent */}
          <div 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-white opacity-70 hover:opacity-100 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevStory();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          
          {/* Bouton suivant */}
          <div 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-white opacity-70 hover:opacity-100 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          {/* Bouton fermer */}
          <div 
            className="absolute top-4 right-4 cursor-pointer text-white opacity-70 hover:opacity-100"
            onClick={handleClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          {/* Afficher StoryActions seulement si l'utilisateur est propriétaire de la story */}
          {currentUserId === currentStory.user_id && (
            <StoryActions 
              storyId={currentStory.id} 
              mediaUrl={currentStory.media_url}
              onDelete={handleStoryDeleted}
            />
          )}
          
          <div className="w-full max-w-md h-full max-h-[80vh] p-4">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            }>
              <StoryMedia storyId={currentStory.id} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;