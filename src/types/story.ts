export interface Story {
  Profile: any;
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  duration?: number; // Ajout du champ duration qui existe dans la BD
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
  expires_at: string; // Ajout du champ nécessaire
  duration?: number; // Ajout du champ duration optionnel
}