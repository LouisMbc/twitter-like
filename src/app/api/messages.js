export async function sendMessage(senderId, receiverId, content) {
    const { error } = await supabase.from("messages").insert([{ sender_id: senderId, receiver_id: receiverId, content }]);
    if (error) throw error;
  }
  
  export async function getMessages(userId, contactId) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .or(`sender_id.eq.${contactId},receiver_id.eq.${contactId}`)
      .order("created_at", { ascending: true });
  
    if (error) throw error;
    return data;
  }
  