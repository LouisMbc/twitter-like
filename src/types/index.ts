// Remove duplicate Profile interface - use the one from profile.ts
export * from './profile';

// Add other types here if needed
// Types pour les profils
export interface Profile {
  id: string;
  user_id: string;
  nickname: string;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  profilePicture?: string | null;
  created_at: string;
  follower_count?: number;
  following_count?: number;
  certified?: boolean;
  is_premium?: boolean;
  premium_features?: any;
}

// Types pour les tweets
export interface Tweet {
  id: string;
  content: string;
  picture?: string[];
  published_at: string;
  view_count: number;
  retweet_id?: string;
  author_id: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

// Types pour les commentaires
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  tweet_id?: string;
  parent_comment_id?: string;
  author_id: string;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string;
  } | null;
}

// Types pour les hashtags
export interface Hashtag {
  id: string;
  name: string;
  usage_count: number;
  created_at: string;
}

// Types pour les abonnements
export interface Subscription {
  id: string;
  profile_id: string;
  subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
}

// Types pour les formulaires
export interface ProfileForm {
  lastName: string;
  firstName: string;
  nickname: string;
  bio: string;
  website?: string;
  location?: string;
  profilePicture: File | null;
  currentProfilePicture?: string;
  coverPicture?: File | null;
  currentCoverPicture?: string | null;
  password: string;
  confirmPassword: string;
  birthDate?: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  content_id?: string;
  content_type: 'tweet' | 'story' | 'follow' | 'like' | 'retweet' | 'message' | 'mention';
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'comment';
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    nickname: string;
    profilePicture?: string;
  };
}