import { useEffect, useState } from "react";
import { getStories } from "@/services/supabase/story";

// Exporter cette fonction qui manque dans votre code
export const useTweetDetails = (tweetId: string) => {
  const [tweet, setTweet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTweetDetails = async () => {
      try {
        // Implémenter la récupération des détails du tweet
        // ...
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement du tweet");
        setLoading(false);
      }
    };

    if (tweetId) {
      fetchTweetDetails();
    }
  }, [tweetId]);

  return { tweet, loading, error };
};

// Votre hook useStories existant
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
