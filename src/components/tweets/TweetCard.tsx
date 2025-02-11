"use client";

import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import CommentList from '@/components/comments/CommentList';
import ReactionBar from '@/components/reactions/ReactionBar';
import supabase  from '@/lib/supabase';
import ViewCount from '@/components/shared/ViewCount';

interface TweetCardProps {
  tweet: {
    id: string;
    content: string;
    picture: string[] | null;
    published_at: string;
    view_count: number;
    author: {
      id: string; // Ajout de l'ID de l'auteur
      nickname: string;
      profilePicture: string | null;
    };
  }
}

export default function TweetCard({ tweet }: TweetCardProps) {
  // Vérification initiale
  if (!tweet || !tweet.author) {
    return <div>Tweet non disponible</div>;
  }

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'Date invalide';
    }
    return formatDistance(parsedDate, new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  const [showComments, setShowComments] = useState(false);
  const [viewCount, setViewCount] = useState(tweet.view_count);

  useEffect(() => {
    const incrementViewCount = async (contentType: 'tweet' | 'comment', id: string) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        // Ajouter une vue
        const { error } = await supabase
          .from('ViewCount')
          .insert([{
            viewer_id: session.user.id,
            ...(contentType === 'tweet' 
              ? { tweet_id: id } 
              : { comment_id: id })
          }])
          .single();

        if (!error) {
          // Mettre à jour le compteur dans la table appropriée
          const table = contentType === 'tweet' ? 'Tweets' : 'Comments';
          const idField = contentType === 'tweet' ? 'tweet_id' : 'comment_id';

          const { data: viewCount } = await supabase
            .from('ViewCount')
            .select('id', { count: 'exact' })
            .eq(idField, id);

          await supabase
            .from(table)
            .update({ view_count: viewCount })
            .eq('id', id);
        }
      } catch (error) {
        console.error('Erreur lors du comptage de la vue:', error);
      }
    };

    incrementViewCount('tweet', tweet.id.toString());
  }, [tweet.id]);

  return (
    <article className="bg-white rounded-lg shadow p-4 mb-4">
      {/* En-tête du tweet avec les infos de l'auteur */}
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
          {tweet.author?.profilePicture ? (
            <img
              src={tweet.author.profilePicture}
              alt={tweet.author.nickname}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Évite la boucle infinie
                // Au lieu de rediriger vers une image qui n'existe pas
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gray-200');
                const initial = document.createElement('span');
                initial.className = 'text-xl text-gray-500';
                initial.textContent = tweet.author.nickname.charAt(0).toUpperCase();
                target.parentElement?.appendChild(initial);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl text-gray-500">
                {tweet.author.nickname.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-bold text-gray-900">
            {tweet.author.nickname}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(tweet.published_at)}
          </p>
        </div>
      </div>

      {/* Contenu du tweet */}
      <p className="text-gray-900 mb-4 whitespace-pre-wrap">
        {tweet.content}
      </p>

      {/* Images du tweet */}
      {tweet.picture && tweet.picture.length > 0 && (
              <div className={`grid gap-2 mb-4 ${
                tweet.picture.length === 1 ? 'grid-cols-1' :
                tweet.picture.length === 2 ? 'grid-cols-2' :
                tweet.picture.length === 3 ? 'grid-cols-2' :
                'grid-cols-2'
              }`}>
                {tweet.picture.map((url: string, index: number) => (
                  <div 
                    key={index}
                    className={`relative rounded-lg overflow-hidden ${
                      (tweet.picture && tweet.picture.length === 3 && index === 0) ? 'col-span-2' : ''
              }`}
            >
              <img
                src={url}
                alt={`Image ${index + 1} du tweet`}
                className="w-full h-full object-cover"
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <ReactionBar tweetId={tweet.id} />
      </div>

      {/* Remplacer l'ancien compteur de vues par le nouveau composant */}
      <ViewCount 
        contentId={tweet.id} 
        contentType="tweet" 
        initialCount={tweet.view_count} 
      />

      {/* Section commentaires */}
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
        >
          <svg 
            className="w-4 h-4 mr-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          Commentaires
        </button>

        {showComments && <CommentList tweetId={tweet.id} />}
      </div>
    </article>
  );
}