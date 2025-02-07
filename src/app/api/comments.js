export async function getComments(tweetId) {
    const { data, error } = await supabase.from("comments").select("*").eq("tweet_id", tweetId);
    if (error) throw error;
    return data;
  }
  
  export async function addComment(tweetId, userId, content) {
    const { error } = await supabase.from("comments").insert([{ tweet_id: tweetId, user_id: userId, content }]);
    if (error) throw error;
  }