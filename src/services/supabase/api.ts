import { Comment } from "@/types";

export async function fetchUserProfile(userId: string) {
  const res = await fetch(`/api/user/${userId}`);
  if (!res.ok) throw new Error("Erreur lors du chargement du profil");
  return res.json();
}

export async function fetchUserTweets(userId: string) {
  const res = await fetch(`/api/user/${userId}/tweets`);
  if (!res.ok) throw new Error("Erreur lors du chargement des tweets");
  return res.json();
}

export async function fetchUserComments(userId: string): Promise<Comment[]> {
  const res = await fetch(`/api/user/${userId}/comments`);
  if (!res.ok) throw new Error("Erreur lors du chargement des commentaires");
  const data = await res.json();
  return data.map((comment: any) => ({
    id: comment.id,
    userId: comment.userId,
    postId: comment.postId,
    text: comment.text || "",
    createdAt: comment.createdAt,
  }));
}
