export async function getProfile(userId) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) throw error;
    return data;
  }
  
  export async function updateProfile(userId, updates) {
    const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
    if (error) throw error;
  }