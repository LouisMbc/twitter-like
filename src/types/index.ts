// Remove duplicate Profile interface - use the one from profile.ts
export * from './profile';

// Add other types here if needed
export interface Tweet {
  id: string;
  content: string;
  picture?: string | null;
  published_at: string;
  view_count: number;
  retweet_id?: string | null;
  author_id: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
    verified?: boolean;
  };
  originalTweet?: any;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  tweet_id: string;
  author_id: string;
  parent_comment_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
}

export interface Subscription {
  id: string;
  profile_id: string;
  subscription_id: string;
  status: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id?: string;
  nickname: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string;
  certified?: boolean;
  is_premium?: boolean;
  premium_features?: any[];
  follower_count?: number;
  following_count?: number;
  created_at?: string;
  updated_at?: string;
}