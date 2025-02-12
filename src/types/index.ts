export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    nickname: string;
    profilePicture: string | null;
  };
  replies?: Comment[];
}