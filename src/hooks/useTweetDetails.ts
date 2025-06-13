import { useEffect, useState } from "react";
import { getStories } from "@/services/supabase/story";
import { tweetService } from "@/services/supabase/tweet";
import { Tweet } from "@/types";

interface StoryData {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string;
  duration: number;
}

export function useTweetDetails(tweetId?: string) {
  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweet = async () => {
      if (!tweetId) {
        setError("Identifiant de tweet manquant");
        setLoading(false);
        return;
      }

      try {
        const { data, error: tweetError } = await tweetService.getTweetById(tweetId);
        
        if (tweetError) throw tweetError;
        if (!data) throw new Error("Tweet non trouvé");
        
        setTweet(data);
        
        // Incrémenter le compteur de vues
        await tweetService.incrementViewCount(tweetId, data.view_count);
      } catch {
        setError("Erreur lors du chargement du tweet");
      } finally {
        setLoading(false);
      }
    };

    fetchTweet();
  }, [tweetId]);

  return { tweet, loading, error };
}

export const useStories = () => {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      const data = await getStories();
      setStories(data);
      setLoading(false);
    };

    fetchStories();
  }, []);

  return { stories, loading };
};
