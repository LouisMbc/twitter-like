import supabase from '@/lib/supabase';
import { notificationService } from './notification';

export const mentionService = {
  // Extraire les mentions d'un texte
  extractMentions: (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
  },

  // Rechercher des utilisateurs pour l'autocomplétion
  searchUsers: async (query: string, limit = 5) => {
    const { data, error } = await supabase
      .from('Profile')
      .select('id, nickname, profilePicture')
      .ilike('nickname', `@${query}%`)
      .limit(limit);

    return { data, error };
  },

  // Vérifier si un pseudo est disponible
  isNicknameAvailable: async (nickname: string) => {
    const { data, error } = await supabase
      .from('Profile')
      .select('id')
      .eq('nickname', nickname)
      .single();

    return { isAvailable: !data, error: error?.code === 'PGRST116' ? null : error };
  },

  // Créer des notifications pour les mentions dans un tweet
  createMentionNotifications: async (tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    // Récupérer les IDs des utilisateurs mentionnés
    const { data: mentionedUsers } = await supabase
      .from('Profile')
      .select('id, nickname, user_id')
      .in('nickname', mentions.map(m => `@${m}`));

    if (!mentionedUsers) return;

    // Récupérer les infos de l'auteur
    const { data: author } = await supabase
      .from('Profile')
      .select('nickname')
      .eq('id', authorId)
      .single();

    // Créer les notifications
    const notifications = mentionedUsers
      .filter(user => user.id !== authorId) // Ne pas notifier l'auteur lui-même
      .map(user => ({
        user_id: user.user_id, // Utiliser user_id pour les notifications
        sender_id: authorId,
        content_id: tweetId,
        content_type: 'tweet' as const,
        type: 'mention',
        message: `vous a mentionné dans un tweet`
      }));

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('Notifications')
        .insert(notifications);

      return { error };
    }

    return { error: null };
  },

  // Créer des notifications pour les mentions dans un commentaire
  createCommentMentionNotifications: async (commentId: string, tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    // Récupérer les IDs des utilisateurs mentionnés
    const { data: mentionedUsers } = await supabase
      .from('Profile')
      .select('id, nickname, user_id')
      .in('nickname', mentions.map(m => `@${m}`));

    if (!mentionedUsers) return;

    // Créer les notifications
    const notifications = mentionedUsers
      .filter(user => user.id !== authorId) // Ne pas notifier l'auteur lui-même
      .map(user => ({
        user_id: user.user_id, // Utiliser user_id pour les notifications
        sender_id: authorId,
        content_id: tweetId, // Lier au tweet principal
        content_type: 'tweet' as const,
        type: 'mention',
        message: `vous a mentionné dans un commentaire`
      }));

    if (notifications.length > 0) {
      const { error } = await supabase
        .from('Notifications')
        .insert(notifications);

      return { error };
    }

    return { error: null };
  }
};