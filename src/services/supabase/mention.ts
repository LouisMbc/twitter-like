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
      // Récupérer les profils des utilisateurs mentionnés
      const { data: mentionedProfiles } = await supabase
        .from('Profile')
        .select('id, nickname')
        .in('nickname', mentions);

      if (!mentionedProfiles || mentionedProfiles.length === 0) return;

      // Récupérer le profil de l'auteur
      const { data: authorProfile } = await supabase
        .from('Profile')
        .select('nickname')
        .eq('id', authorId)
        .single();

      const authorNickname = authorProfile?.nickname || 'Quelqu\'un';

      // Créer une notification pour chaque utilisateur mentionné
      const notifications = mentionedProfiles
        .filter(profile => profile.id !== authorId) // Ne pas notifier l'auteur s'il se mentionne
        .map(profile => ({
          user_id: profile.id,
          sender_id: authorId,
          content_id: tweetId,
          content_type: 'mention' as const,
          type: 'mention' as const,
          message: `@${authorNickname} vous a mentionné dans un tweet`,
          is_read: false
        }));

      if (notifications.length === 0) return;

      const { data, error } = await supabase
        .from('Notifications')
        .insert(notifications)
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création des notifications de mention:', error);
      return { data: null, error };
    }
  },

  // Créer des notifications pour les mentions dans les commentaires
  createCommentMentionNotifications: async (commentId: string, tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;

    try {
      // Récupérer les profils des utilisateurs mentionnés
      const { data: mentionedProfiles } = await supabase
        .from('Profile')
        .select('id, nickname')
        .in('nickname', mentions);

      if (!mentionedProfiles || mentionedProfiles.length === 0) return;

      // Récupérer le profil de l'auteur
      const { data: authorProfile } = await supabase
        .from('Profile')
        .select('nickname')
        .eq('id', authorId)
        .single();

      const authorNickname = authorProfile?.nickname || 'Quelqu\'un';

      // Créer une notification pour chaque utilisateur mentionné
      const notifications = mentionedProfiles
        .filter(profile => profile.id !== authorId) // Ne pas notifier l'auteur s'il se mentionne
        .map(profile => ({
          user_id: profile.id,
          sender_id: authorId,
          content_id: tweetId, // Lier au tweet original, pas au commentaire
          content_type: 'mention' as const,
          type: 'mention' as const,
          message: `@${authorNickname} vous a mentionné dans une réponse`,
          is_read: false
        }));

      if (notifications.length === 0) return;

      const { data, error } = await supabase
        .from('Notifications')
        .insert(notifications)
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création des notifications de mention:', error);
      return { data: null, error };
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
      
      // Nettoyer les nicknames pour éviter les @ doubles
      if (data) {
        data.forEach(user => {
          if (user.nickname) {
            // Supprimer tous les @ en début de nickname
            user.nickname = user.nickname.replace(/^@+/, '');
          }
        });
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};