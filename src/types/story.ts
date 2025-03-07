export interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
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
}