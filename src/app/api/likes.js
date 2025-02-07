export async function likeTweet(tweetId, userId) {
    const { error } = await supabase.from("likes").insert([{ tweet_id: tweetId, user_id: userId }]);
    if (error) throw error;
  }
  
  export async function getLikes(tweetId) {
    const { data, error } = await supabase.from("likes").select("*").eq("tweet_id", tweetId);
    if (error) throw error;
    return data;
  }