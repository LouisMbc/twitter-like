import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { UserLanguagePreferences } from '@/types/language';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export async function getUserLanguagePreferences(userId: string): Promise<UserLanguagePreferences | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('language_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching language preferences:', error);
    return null;
  }
  
  return data ? {
    userId: data.user_id,
    selectedLanguages: data.selected_languages,
    defaultLanguage: data.default_language,
  } : null;
}

export async function updateUserLanguagePreferences(preferences: UserLanguagePreferences): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('language_preferences')
    .upsert({
      user_id: preferences.userId,
      selected_languages: preferences.selectedLanguages,
      default_language: preferences.defaultLanguage,
    });
    
  if (error) {
    console.error('Error updating language preferences:', error);
    return false;
  }
  
  return true;
}