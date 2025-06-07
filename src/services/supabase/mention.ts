import supabase from '@/lib/supabase';

export const mentionService = {
  // Extraire les mentions (@username) du texte
  extractMentions: (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]); // Récupérer le nom d'utilisateur sans le @
    }
    
    return [...new Set(mentions)]; // Supprimer les doublons
  },

  // Créer des notifications pour les mentions dans les tweets
  createMentionNotifications: async (tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    try {
      // Récupérer les IDs des utilisateurs mentionnés
      const { data: mentionedUsers, error: usersError } = await supabase
        .from('Profile')
        .select('id, nickname')
        .in('nickname', mentions);

      if (usersError) throw usersError;

      if (mentionedUsers && mentionedUsers.length > 0) {
        // Créer une notification pour chaque utilisateur mentionné
        const notifications = mentionedUsers
          .filter(user => user.id !== authorId) // Ne pas notifier l'auteur
          .map(user => ({
            user_id: user.id,
            sender_id: authorId,
            content_id: tweetId,
            content_type: 'tweet',
            type: 'mention',
            message: `vous a mentionné dans un tweet`
          }));

        if (notifications.length > 0) {
          const { error: notifError } = await supabase
            .from('Notifications')
            .insert(notifications);

          if (notifError) throw notifError;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création des notifications de mention:', error);
      throw error;
    }
  },

  // Créer des notifications pour les mentions dans les commentaires
  createCommentMentionNotifications: async (commentId: string, tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    try {
      // Récupérer les IDs des utilisateurs mentionnés
      const { data: mentionedUsers, error: usersError } = await supabase
        .from('Profile')
        .select('id, nickname')
        .in('nickname', mentions);

      if (usersError) throw usersError;

      if (mentionedUsers && mentionedUsers.length > 0) {
        // Créer une notification pour chaque utilisateur mentionné
        const notifications = mentionedUsers
          .filter(user => user.id !== authorId) // Ne pas notifier l'auteur
          .map(user => ({
            user_id: user.id,
            sender_id: authorId,
            content_id: commentId,
            content_type: 'comment',
            type: 'mention',
            message: `vous a mentionné dans un commentaire`
          }));

        if (notifications.length > 0) {
          const { error: notifError } = await supabase
            .from('Notifications')
            .insert(notifications);

          if (notifError) throw notifError;
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création des notifications de mention:', error);
      throw error;
    }
  },

  // Rechercher des utilisateurs pour l'autocomplétion
  searchUsers: async (query: string, limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('id, nickname, profilePicture')
        .ilike('nickname', `%${query}%`)
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};