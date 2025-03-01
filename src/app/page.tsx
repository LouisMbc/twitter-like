"use client";

import TweetList from '../components/tweets/TweetList';
import CreateTweetPage from '../app/tweets/Tweets';
import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import Link from 'next/link';

import { Tweet } from '../types';

export default function Home() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [tweets, setTweets] = useState<Tweet[]>([]);

  useEffect(() => {
    async function fetchTweets() {
      try {
        const { data, error } = await supabase
          .from('Tweets')
          .select('*');

        if (error) {
          setStatus('Erreur de connexion: ' + error.message);
        } else {
          setStatus('Connexion réussie!');
          setTweets(data as Tweet[]);
        }
      } catch (err) {
        setStatus('Erreur: ' + (err as Error).message);
      }
    }

    fetchTweets();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-blue-100">
      <div className="flex justify-between mb-4">
        <Link href="/auth/login" className="text-blue-500 underline">
          Se connecter
        </Link>
        <Link href="/auth/register" className="text-blue-500 underline">
          S'inscrire
        </Link>
        <Link href="/profile" className="text-blue-500 underline">
          Profil
        </Link>
      </div>
      <CreateTweetPage />
      <TweetList tweets={tweets} />
    </div>
  );
}