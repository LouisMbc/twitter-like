import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const isBrowser = typeof window !== 'undefined';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storage: isBrowser ? window.localStorage : undefined
  }
});

export default supabase;
