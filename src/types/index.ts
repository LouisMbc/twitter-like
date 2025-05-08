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
  // Add these properties to match what's being accessed in the profile page
  nickname?: string; // Same as author.nickname
  first_name?: string;
  last_name?: string;
  profile_picture?: string | null; // Same as author.profilePicture
}

export interface Profile {
  username: any;
  full_name: any;
  languages(languages: any): unknown;
  id: string;           // Ajout du champ id qui est nécessaire pour la recherche
  user_id: string;      // Ajout du champ user_id
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string | null;
  profilePicture: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
}

// Si vous décidez d'étendre votre interface Tweet
export interface Tweet {
  [x: string]: any;
  id: string;
  content: string;
  picture?: string[] | null;
  published_at: string;
  view_count: number;
  retweet_id?: string | null;
  author: {
    id: string;
    nickname: string;
    profilePicture?: string | null;
  };
  author_id?: string; // Optionnel si vous avez déjà author
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
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string;
  password: string;
  confirmPassword: string;
  profilePicture?: File | null;
  currentProfilePicture?: string | null;
}