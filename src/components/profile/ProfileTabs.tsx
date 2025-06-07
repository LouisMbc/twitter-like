import { useState } from 'react';
import { Tweet, Comment } from '@/types';

// Import des composants avec chemins corrects
import TweetCard from '@/components/tweets/TweetCard';

// Interface pour un commentaire simple à afficher
interface CommentDisplay {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  tweet_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

interface ProfileTabsProps {
  tweets: Tweet[];
  comments: Comment[];
  mediaTweets: Tweet[];
  likedTweets: Tweet[];
  loading: boolean;
}

// Composant simple pour afficher un commentaire
const CommentDisplay: React.FC<{ comment: CommentDisplay }> = ({ comment }) => {
  return (
    <div className="p-4 border-b border-gray-800 hover:bg-gray-950 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
          {comment.author?.profilePicture ? (
            <img
              src={comment.author.profilePicture}
              alt={comment.author.nickname || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-xs">
              {comment.author?.nickname?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-white text-sm">
              {comment.author?.nickname || 'Utilisateur'}
            </span>
            <span className="text-gray-500 text-xs">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm">{comment.content}</p>
          
          <div className="flex items-center mt-2 text-gray-500 text-xs space-x-4">
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              <span>{comment.view_count || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfileTabs({ 
  tweets, 
  comments, 
  mediaTweets, 
  likedTweets, 
  loading 
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'media' | 'likes'>('posts');

  const tabs = [
    { id: 'posts', label: 'Posts', count: tweets.length },
    { id: 'replies', label: 'Réponses', count: comments.length },
    { id: 'media', label: 'Médias', count: mediaTweets.length },
    { id: 'likes', label: 'J\'aime', count: likedTweets.length }
  ];

  if (loading) {
    return (
      <div className="w-full">
        <div className="border-b border-gray-800">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className="flex-1 px-4 py-4 text-center font-medium text-gray-500 border-b-2 border-transparent"
              >
                <div className="flex flex-col items-center space-y-1">
                  <span>{tab.label}</span>
                  <span className="text-xs">0</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Onglets */}
      <div className="border-b border-gray-800">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-4 text-center font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-white border-red-500'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span>{tab.label}</span>
                <span className="text-xs">{tab.count}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="min-h-[400px]">
        {activeTab === 'posts' && (
          <div className="space-y-0">
            {tweets.length > 0 ? (
              tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucun post pour le moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'replies' && (
          <div className="space-y-0">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <CommentDisplay key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Aucune réponse pour le moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="p-4">
            {mediaTweets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mediaTweets.map((tweet) => (
                  <div key={tweet.id} className="aspect-square bg-gray-900 rounded-lg overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity relative">
                    {tweet.picture && tweet.picture.length > 0 && (
                      <img
                        src={tweet.picture[0]}
                        alt="Média du tweet"
                        className="w-full h-full object-cover"
                        onClick={() => {
                          window.location.href = `/tweet/${tweet.id}`;
                        }}
                      />
                    )}
                    {tweet.picture && tweet.picture.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{tweet.picture.length - 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto w-12 h-12 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                <p>Aucun média partagé pour le moment</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="space-y-0">
            {likedTweets.length > 0 ? (
              likedTweets.map((tweet) => (
                <div key={tweet.id} className="relative">
                  <div className="absolute top-4 left-4 flex items-center text-gray-500 text-sm z-10">
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span>Aimé</span>
                  </div>
                  <div className="pt-8">
                    <TweetCard tweet={tweet} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto w-12 h-12 mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <p>Aucun tweet aimé pour le moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}