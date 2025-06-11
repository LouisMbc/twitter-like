"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hashtagService } from '@/services/supabase/hashtag';
import { useAuth } from '@/hooks/useAuth';
import TweetList from '@/components/tweets/TweetList';
import { Tweet } from '@/types';
import { Hashtag } from '@/types/index';
import supabase from '@/lib/supabase';

interface HashtagPageProps {
    params: {
        name: string;
    };
}

export default function HashtagPage({ params }: HashtagPageProps) {
    const hashtagName = decodeURIComponent(params.name);
    const router = useRouter();
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [hashtag, setHashtag] = useState<Hashtag | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);    useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Récupération parallèle des données essentielles
                const [sessionResult, hashtagResult] = await Promise.all([
                    supabase.auth.getSession(),
                    supabase
                        .from('hashtags') 
                        .select('id, name, usage_count, created_at')
                        .eq('name', hashtagName.toLowerCase())
                        .single()
                ]);

                const { data: { session } } = sessionResult;
                const { data: hashtagData } = hashtagResult;

                // 2. Affichage immédiat du hashtag
                if (hashtagData) {
                    setHashtag(hashtagData);
                }

                // 3. Récupération du profil utilisateur si connecté
                let currentProfileId = null;
                if (session) {
                    const { data: profile } = await supabase
                        .from('Profile')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .single();
                    
                    if (profile) {
                        currentProfileId = profile.id;
                        setProfileId(profile.id);
                    }
                }

                // 4. Arrêt du loading principal
                setLoading(false);

                // 5. Chargement asynchrone des tweets (sans bloquer l'UI)
                if (hashtagData) {
                    hashtagService.getTweetsByHashtag(hashtagName, 0, 10)
                        .then(({ data: tweetData, error: tweetError }) => {
                            if (tweetError) {
                                console.error('Erreur tweets:', tweetError);
                                return;
                            }
                            
                            if (tweetData) {
                                const formattedTweets = tweetData.map((item: any) => ({
                                    id: item.Tweets.id,
                                    content: item.Tweets.content,
                                    picture: item.Tweets.picture,
                                    published_at: item.Tweets.published_at,
                                    view_count: item.Tweets.view_count,
                                    retweet_id: item.Tweets.retweet_id,
                                    author: item.Tweets.author,
                                    author_id: item.Tweets.author_id
                                }));
                                setTweets(formattedTweets);
                            }
                        })
                        .catch(error => console.error('Erreur tweets:', error));
                }

                // 6. Chargement asynchrone des états (encore plus en arrière-plan)
                if (currentProfileId && hashtagData) {
                    setTimeout(() => {
                        Promise.all([
                            hashtagService.isSubscribed(currentProfileId, hashtagData.id),
                            hashtagService.isBlocked(currentProfileId, hashtagData.id)
                        ]).then(([subscribed, blocked]) => {
                            setIsSubscribed(subscribed.isSubscribed);
                            setIsBlocked(blocked.isBlocked);
                        }).catch(error => {
                            console.error('Erreur états:', error);
                        });
                    }, 100);
                }
            } catch (error) {
                console.error('Erreur chargement:', error);
                setLoading(false);
            }
        };

        if (hashtagName) {
            fetchData();
        }
    }, [hashtagName]);

    const handleSubscribe = async () => {
        if (!profileId || !hashtag) return;

        try {
            if (isSubscribed) {
                await hashtagService.unsubscribeFromHashtag(profileId, hashtag.id);
                setIsSubscribed(false);
            } else {
                await hashtagService.subscribeToHashtag(profileId, hashtag.id);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Erreur lors de l\'abonnement:', error);
        }
    };

    const handleBlock = async () => {
        if (!profileId || !hashtag) return;

        try {
            if (isBlocked) {
                await hashtagService.unblockHashtag(profileId, hashtag.id);
                setIsBlocked(false);
            } else {
                await hashtagService.blockHashtag(profileId, hashtag.id);
                setIsBlocked(true);
                setIsSubscribed(false);
            }
        } catch (error) {
            console.error('Erreur lors du blocage:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8 text-gray-400">Chargement...</div>;
    }

    if (!hashtag) {
        return <div className="flex justify-center p-8 text-gray-400">Hashtag non trouvé</div>;
    }    return (
        <div className="space-y-6">
            {/* Bouton de retour */}
            <div className="flex items-center mb-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-3 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-red-500 transition-all duration-300 group shadow-lg hover:shadow-red-500/25"
                >
                    <svg 
                        className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="font-semibold">Retour</span>
                </button>
            </div>

            {/* En-tête du hashtag */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg border border-red-500/20 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-red-400 drop-shadow-lg">#{hashtag.name}</h1>
                        <p className="text-gray-300 mt-2 text-lg">
                            {hashtag.usage_count} tweet{hashtag.usage_count > 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    {profileId && (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubscribe}
                                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    isSubscribed
                                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/25'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-red-400'
                                }`}
                            >
                                {isSubscribed ? 'Abonné' : 'S\'abonner'}
                            </button>
                            
                            <button
                                onClick={handleBlock}
                                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                                    isBlocked
                                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600 hover:border-orange-400'
                                }`}
                            >
                                {isBlocked ? 'Débloqué' : 'Bloquer'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Liste des tweets */}
            <div className="space-y-4">
                {tweets.length === 0 ? (
                    <div className="text-center text-gray-400 py-12 bg-gray-800 rounded-xl border border-gray-700">
                        <div className="text-lg font-medium mb-2">Aucun tweet trouvé</div>
                        <div className="text-sm">pour #{hashtag.name}</div>
                    </div>
                ) : (
                    <TweetList tweets={tweets} />
                )}
            </div>
        </div>
    );
}
