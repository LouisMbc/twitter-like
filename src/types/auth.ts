//Types pour auth

import { Session } from '@supabase/supabase-js';
import { UserLanguagePreferences } from './language';

interface UserMetadata {
  [key: string]: string | number | boolean;
}

interface AppMetadata {
  [key: string]: string | number | boolean;
}

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: UserMetadata;
    app_metadata?: AppMetadata;
  };
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: UserMetadata;
  app_metadata?: AppMetadata;
}

