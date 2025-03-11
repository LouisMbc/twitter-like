//Hook pour les stories
import { useEffect, useState } from "react";
import { getStories } from "@/services/supabase/story";

export const useStories = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStories = async () => {
    setLoading(true);
    const data = await getStories();
    setStories(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  return { 
    stories, 
    loading,
    refreshStories: fetchStories
  };
};