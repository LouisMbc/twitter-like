export interface Comment {
  id: number;
  userId: string;
  postId: string;
  text: string; 
  createdAt: string;
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
}

export interface Tweet {
  id: string;
  content: string;
  picture?: string[] | null;
  published_at: string;
  view_count: number;
  retweet_id?: string | null;
  author_id: string;
  comments: Comment[];
  author: Author;
}

export interface Author {
  id: string;
  username: string;
  profile_image_url: string;
  name: string;
  profilePicture: string | null;
  nickname: string;
}

export interface ProfilePageData {
  profile: Profile;
  tweets: Tweet[];
  comments: Comment[];
  followersCount: number;
  followingCount: number;
}