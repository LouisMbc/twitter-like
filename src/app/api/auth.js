import { supabase } from "../../lib/supabase";

export async function signInWithEmail(email, password) {
  const { user, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return user;
}

export async function signUpWithEmail(email, password) {
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return user;
}

export async function signOut() {
  await supabase.auth.signOut();
}