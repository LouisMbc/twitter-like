// Remove duplicate Profile interface - use the one from profile.ts
export * from './profile';

// Add other types here if needed
export interface Tweet {
  id: string;
  content: string;
  picture?: string[] | null;
  published_at: string;
  view_count: number;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string | null;
  };
  author_id?: string; // Optionnel si vous avez déjà author
  retweet_id?: string | null;
  originalTweet?: Omit<Tweet, 'originalTweet'> | null; // Tweet original si c'est un retweet
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  view_count: number;
  parent_comment_id?: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
  replies?: Comment[];
  tweet_id: string;
}

export interface Subscription {
  id: string;
  profile_id: string;
  subscription_id: string;
  status: string;
  plan: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
  created_at?: string;
  updated_at?: string;
  customer_id?: string;
}

export interface Profile {
  id: string;               // uuid
  user_id: string;          // uuid lié à auth.users
  firstName: string | null; // text
  lastName: string | null;  // text
  nickname: string | null;  // text
  bio: string | null;       // text
  profilePicture: string | null; // text (URL de l'image)
  certified: boolean;       // boolean
  follower_count: number;   // integer
  following_count: number;  // integer
  created_at: string;       // timestamp with time zone
  is_premium: boolean;      // boolean
  premium_features: any;    // jsonb
}

// Ajouter aux types existants
export interface ProfilePageData {
  profile: Profile;
  tweets: Tweet[];
  comments: Comment[];
  followersCount: number;
  followingCount: number;
}

export interface ProfileForm {
  location: any;
  currentCoverPicture: any;
  website: string;
  lastName: string;
  firstName: string;
  nickname: string;
  bio: string;
  profilePicture: File | null;
  currentProfilePicture?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

export interface Hashtag {
  id: string;
  name: string;
  usage_count: number;
  created_at: string;
}

export interface TweetHashtag {
  id: string;
  tweet_id: string;
  hashtag_id: string;
  created_at: string;
  hashtag?: Hashtag;
}

export interface HashtagSubscription {
  id: string;
  profile_id: string;
  hashtag_id: string;
  created_at: string;
  hashtag?: Hashtag;
}

export interface HashtagBlock {
  id: string;
  profile_id: string;
  hashtag_id: string;
  created_at: string;
  hashtag?: Hashtag;
}