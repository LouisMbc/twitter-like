//Types pour auth

import { Session } from '@supabase/supabase-js';
import { UserLanguagePreferences } from './language';

export interface AuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      [key: string]: any;
    };
    app_metadata?: {
      [key: string]: any;
    };
  };
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    [key: string]: any;
  };
  app_metadata?: {
    [key: string]: any;
  };
}

