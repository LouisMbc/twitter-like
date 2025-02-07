"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Explore() {
  const [hashtags, setHashtags] = useState([]);

  useEffect(() => {
    async function fetchHashtags() {
      const { data, error } = await supabase.rpc("get_popular_hashtags");
      if (error) console.error(error);
      else setHashtags(data);
    }
    fetchHashtags();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bangers">Explorer</h1>
      <ul className="mt-4">
        {hashtags.map((tag, index) => (
          <li key={index} className="text-primary font-bold">#{tag.hashtag} ({tag.count})</li>
        ))}
      </ul>
    </div>
  );
}
