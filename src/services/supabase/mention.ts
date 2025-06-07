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

    // Ne plus créer de notifications automatiques pour les mentions
    console.log('Mentions détectées:', mentions, 'mais notifications désactivées');
    return;
  },

  // Créer des notifications pour les mentions dans les commentaires
  createCommentMentionNotifications: async (commentId: string, tweetId: string, authorId: string, mentions: string[]) => {
    if (mentions.length === 0) return;
    return;
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