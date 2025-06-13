interface StoryProfile {
  id: string;
  nickname: string;
  profilePicture: string | null;
}

export interface Story {
  Profile: StoryProfile;
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  duration?: number;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
}

export interface CreateStoryDTO {
  content: string;
  media_url: string;
  media_type: 'image' | 'video';
  user_id: string;
  expires_at: string;
  duration?: number;
}