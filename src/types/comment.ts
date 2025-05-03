import { Profile } from './profile'; // Import the Profile interface

export interface Comment {
    id: string;
    content: string;
    created_at: string;
    view_count: number;
    parent_comment_id?: string;
    profile_picture?: string | null; // Utilisez null si c'est acceptable
    Profile: Profile;
  }
  