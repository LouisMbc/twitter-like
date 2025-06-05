"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hashtagService } from '@/services/supabase/hashtag';
import { useAuth } from '@/hooks/useAuth';
import { Hashtag } from '@/types/index';

export default function ExplorePage() {
  const [popularHashtags, setPopularHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useAuth();

  useEffect(() => {
    const fetchPopularHashtags = async () => {
      try {
        const { data } = await hashtagService.getPopularHashtags(30);
        setPopularHashtags(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des hashtags populaires:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularHashtags();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Explorer les tendances</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularHashtags.map((hashtag) => (
            <div
              key={hashtag.id}
              onClick={() => router.push(`/hashtags/${hashtag.name}`)}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-xl">#</span>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-600">#{hashtag.name}</h3>
                  <p className="text-sm text-gray-500">
                    {hashtag.usage_count} tweet{hashtag.usage_count > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {popularHashtags.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Aucun hashtag populaire pour le moment
          </div>
        )}
      </div>
    </div>
  );
}