export interface Profile {
  id: string;
  user_id: string;
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  bio: string | null;
  profilePicture: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
  certified: boolean;
  is_premium: boolean;
  premium_features: any;
}

export interface ProfileForm {
  lastName: string;
  firstName: string;
  nickname: string;
  bio: string;
  profilePicture: File | null;
  password?: string;
  confirmPassword?: string;
  currentProfilePicture?: string;
}
