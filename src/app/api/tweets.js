import { supabase } from "@/lib/supabase";

export async function getTweets() {
  const { data, error } = await supabase.from("tweets").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTweet(content, userId) {
  const { error } = await supabase.from("tweets").insert([{ content, author_id: userId }]);
  if (error) throw error;
}
