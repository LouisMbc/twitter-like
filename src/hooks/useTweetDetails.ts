import { useEffect, useState } from "react";
import { getStories } from "@/services/supabase/story";
import { tweetService } from "@/services/supabase/tweet";

export const useTweetDetails = (tweetId: string) => {
  const [tweet, setTweet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweetDetails = async () => {
      if (!tweetId) {
        setError("ID du tweet manquant");
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
      } catch (err) {
        console.error("Erreur lors du chargement du tweet:", err);
        setError("Erreur lors du chargement du tweet");
      } finally {
        setLoading(false);
      }
    };

    if (tweetId) {
      fetchTweetDetails();
    }
  }, [tweetId]);

  return { tweet, loading, error };
};

export const useStories = () => {
  const [stories, setStories] = useState<any[]>([]);
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
