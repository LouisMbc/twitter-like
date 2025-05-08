export interface Profile {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
  nickname: string;
  bio: string | null;
  profilePicture: string | null;
  created_at: string;
  follower_count: number;
  following_count: number;
  // Ces champs sont dans useProfileData.ts
  username?: any;
  full_name?: any;
  languages?(languages: any): unknown;
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
