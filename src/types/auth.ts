//Types pour auth

import { Session } from '@supabase/supabase-js';
import { UserLanguagePreferences } from './language';

export type AuthSession = {
    user: {
      id: string;
      email?: string;
      // Add other user properties as needed
    };
    // Add other session properties as needed
  }

