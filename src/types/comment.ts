import { Profile } from './profile'; // Import the Profile interface

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    view_count: number;
    parent_comment_id?: string;
    author?: {
      id: string;
      nickname: string;
      profilePicture: string | null;
    };
    author_id?: string; // Add author_id field to match database
    replies?: Comment[];
    tweet_id: string;
    profile_picture?: string | null;
    Profile?: Profile;
    // Champs compatibles avec index.ts
    nickname?: string;
    first_name?: string;
    last_name?: string;
}
