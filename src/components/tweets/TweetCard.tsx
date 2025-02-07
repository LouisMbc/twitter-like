"use client";

import { useState } from 'react';
import Image from 'next/image';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import supabase from '@/lib/supabase';

interface TweetCardProps {
  tweet: {
    id: number;
    content: string;
    picture: string[];
    published_at: string;
    view_count: number;
    author: {
      nickname: string;
      profilePicture: string;
    };
  }
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const [imageError, setImageError] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const files = e.target.files;
      if (!files) return;

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `tweets/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('tweets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('tweets')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(urls);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: string) => {
    return formatDistance(new Date(date), new Date(), {
      addSuffix: true,
      locale: fr
    });
  };

  return (
    <article className="bg-white rounded-lg shadow p-4 mb-4">
      {/* En-tête du tweet avec les infos de l'auteur */}
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
          {tweet.author.profilePicture ? (
            <img
              src={tweet.author.profilePicture}
              alt={tweet.author.nickname}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
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
          {tweet.picture.map((url, index) => (
            <div 
              key={index}
              className={`relative rounded-lg overflow-hidden ${
                tweet.picture.length === 3 && index === 0 ? 'col-span-2' : ''
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

      {/* Input pour l'upload d'images */}
      <div className="mb-4">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {uploading && <p className="text-sm text-gray-500 mt-2">Chargement des images...</p>}
      </div>

      {/* Compteur de vues */}
      <div className="flex items-center text-sm text-gray-500">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 mr-1"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
        </svg>
        <span>{tweet.view_count.toLocaleString()} vues</span>
      </div>
    </article>
  );
}