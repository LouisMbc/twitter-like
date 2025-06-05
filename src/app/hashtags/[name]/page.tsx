"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { hashtagService } from '@/services/supabase/hashtag';
import { useAuth } from '@/hooks/useAuth';
import TweetList from '@/components/tweets/TweetList';
import { Tweet } from '@/types';
import { Hashtag } from '@/types/index';
import supabase from '@/lib/supabase';

export default function HashtagPage() {
    const params = useParams();
    const hashtagName = params.name as string;
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [hashtag, setHashtag] = useState<Hashtag | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Récupérer le profil utilisateur
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    const { data: profile } = await supabase
                        .from('Profile')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .single();
                    
                    if (profile) {
                        setProfileId(profile.id);
                    }
                }

                // Récupérer les informations du hashtag
                const { data: hashtagData } = await supabase
                    .from('hashtags') 
                    .select('*')
                    .eq('name', hashtagName.toLowerCase())
                    .single();

                if (hashtagData) {
                    setHashtag(hashtagData);

                    // Vérifier si l'utilisateur est abonné/a bloqué ce hashtag
                    if (profileId) {
                        const { isSubscribed: subscribed } = await hashtagService.isSubscribed(profileId, hashtagData.id);
                        const { isBlocked: blocked } = await hashtagService.isBlocked(profileId, hashtagData.id);
                        setIsSubscribed(subscribed);
                        setIsBlocked(blocked);
                    }
                }

                // Récupérer les tweets du hashtag
                const { data: tweetData } = await hashtagService.getTweetsByHashtag(hashtagName);
                
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
            } catch (error) {
                console.error('Erreur lors du chargement du hashtag:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [hashtagName, profileId]);

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
                setIsSubscribed(false); // Se désabonner automatiquement si on bloque
            }
        } catch (error) {
            console.error('Erreur lors du blocage:', error);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8 text-slate-600">Chargement...</div>;
    }

    if (!hashtag) {
        return <div className="flex justify-center p-8 text-slate-600">Hashtag non trouvé</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 bg-slate-50 min-h-screen">
            {/* En-tête du hashtag */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-sky-500">#{hashtag.name}</h1>
                        <p className="text-slate-500 mt-1">
                            {hashtag.usage_count} tweet{hashtag.usage_count > 1 ? 's' : ''}
                        </p>
                    </div>
                    
                    {profileId && (
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubscribe}
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                                    isSubscribed
                                        ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-md'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                                }`}
                            >
                                {isSubscribed ? 'Abonné' : 'S\'abonner'}
                            </button>
                            
                            <button
                                onClick={handleBlock}
                                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                                    isBlocked
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
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
                    <div className="text-center text-slate-500 py-12 bg-white rounded-xl border border-slate-200">
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