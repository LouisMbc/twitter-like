import supabase from '@/lib/supabase';

export interface Mention {
  id: string;
  nickname: string;
  profilePicture?: string;
}

export const mentionService = {  // Extraire les mentions d'un texte
  extractMentions: (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Retourner le pseudo complet avec le @ pour la cohérence
      mentions.push(`@${match[1]}`);
    }

    return mentions;
  },

  // Rechercher des utilisateurs pour l'autocomplétion
  searchUsers: async (query: string, limit = 5) => {
    if (query.length < 2) return [];

    // S'assurer que la requête commence par @
    const searchQuery = query.startsWith('@') ? query : `@${query}`;
    
    const { data, error } = await supabase
      .from('Profile')
      .select('id, nickname, profilePicture')
      .ilike('nickname', `${searchQuery}%`)
      .limit(limit);

    return { data, error };
  },

  // Vérifier si un pseudo est disponible
  isNicknameAvailable: async (nickname: string) => {
    // S'assurer que le nickname commence par @
    const searchNickname = nickname.startsWith('@') ? nickname : `@${nickname}`;
    
    const { data, error } = await supabase
      .from('Profile')
      .select('id')
      .eq('nickname', searchNickname)
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
      .in('nickname', mentions); // mentions contiennent déjà le @

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
      .in('nickname', mentions); // mentions contiennent déjà le @

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
  },

  createMentions: async (tweetId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    try {
      // Récupérer les IDs des utilisateurs mentionnés
      const { data: profiles, error: profileError } = await supabase
        .from('Profile')
        .select('id, nickname')
        .in('nickname', mentions);

      if (profileError) throw profileError;

      if (profiles && profiles.length > 0) {
        const mentionData = profiles.map(profile => ({
          tweet_id: tweetId,
          mentioned_user_id: profile.id
        }));

        const { error: insertError } = await supabase
          .from('Mentions')
          .insert(mentionData);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Erreur lors de la création des mentions:', error);
    }
  }
};