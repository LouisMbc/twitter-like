// src/lib/supabase-browser.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isBrowser = typeof window !== 'undefined';

if (!supabaseUrl || !supabaseKey) {
  if (isBrowser) {
    console.error('Missing Supabase environment variables');
  }
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: true,
      storage: isBrowser ? window.localStorage : undefined
    }
  }
);

export default supabase;