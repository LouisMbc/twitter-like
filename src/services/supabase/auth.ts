import supabase from '@/lib/supabase';
import { AuthSession } from '@/types/auth';


export const authService = {
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  signInWithPassword: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signInWithOtp: async (email: string, options?: { emailRedirectTo: string }) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  updatePassword: async (password: string, _confirmPassword?: string | null) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    return { data, error };
  },

  verifyAuthCallback: async (session: AuthSession) => {
    const { data: profile, error } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    return { profile, error };
  }
};