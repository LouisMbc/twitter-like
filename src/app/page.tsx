"use client";

import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import TweetList from '../components/tweets/TweetList';
import  CreateTweetPage from '../app/tweets/Tweets';

import { Tweet } from '../types';

export default function Home() {
  const [status, setStatus] = useState<string>('Testing connection...');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [files, setFiles] = useState<string[]>([]);

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

  useEffect(() => {
    async function fetchFiles() {
      try {
        const response = await fetch('/api/files');
        const data = await response.json();
        setFiles(data.files);
      } catch (err) {
        console.error('Erreur lors de la récupération des fichiers:', err);
      }
    }

    fetchFiles();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1>Test de connexion Supabase</h1>
      <p>{status}</p>
      CreateTweetPage
      <TweetList tweets={tweets} />      
    </div>
  );
}