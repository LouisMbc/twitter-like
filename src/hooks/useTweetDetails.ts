import { useEffect, useState } from "react";
import { getStories } from "@/services/supabase/stories";

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
