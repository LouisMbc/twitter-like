// src/services/supabase/message.ts
import supabase from '@/lib/supabase';

interface MessageData {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: ProfileData;
  recipient?: ProfileData;
}

interface ProfileData {
  id: string;
  nickname: string;
  profilePicture?: string;
}

interface ConversationData {
  id: string;
  nickname: string;
  profilePicture?: string;
  user?: ProfileData;
  lastMessage?: MessageData;
  unreadCount: number;
  last_message_at?: string;
}

export const messageService = {
  // Récupérer les conversations de l'utilisateur
  getConversations: async (userId: string) => {
    // Cette requête obtient toutes les conversations uniques de l'utilisateur
    const { data, error } = await supabase
      .from('Messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        is_read,
        sender:Profile!Messages_sender_id_fkey(id, nickname, profilePicture),
        recipient:Profile!Messages_recipient_id_fkey(id, nickname, profilePicture)
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) return { error };

    // Regrouper les messages par conversation (par utilisateur)
    const conversations: Record<string, ConversationData> = {};
    
    data?.forEach((message: MessageData) => {
      // Déterminer qui est l'autre utilisateur dans la conversation
      const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      const otherUser = message.sender_id === userId ? message.recipient : message.sender;
      
      // Exclure les conversations avec soi-même
      if (otherUserId === userId) {
        return; // Ignorer les messages avec soi-même
      }
      
      // Déterminer qui est l'expéditeur et le destinataire
      const sender = message.sender;
      const recipient = message.recipient;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          id: otherUserId,
          nickname: otherUser?.nickname || 'Utilisateur',
          profilePicture: otherUser?.profilePicture,
          user: otherUser,
          lastMessage: {
            ...message,
            sender,
            recipient
          },
          unreadCount: sender?.id !== userId && !message.is_read ? 1 : 0,
          last_message_at: message.created_at
        };
      } else {
        if (new Date(message.created_at) > new Date(conversations[otherUserId].last_message_at || '')) {
          // Mettre à jour le dernier message s'il est plus récent
          conversations[otherUserId].lastMessage = {
            ...message,
            sender,
            recipient
          };
          conversations[otherUserId].last_message_at = message.created_at;
        }
        
        // Incrémenter le compteur de non lus si nécessaire
        if (sender?.id !== userId && !message.is_read) {
          conversations[otherUserId].unreadCount += 1;
        }
      }
    });

    const conversationsList = Object.values(conversations).sort((a, b) => 
      new Date(b.last_message_at || '').getTime() - new Date(a.last_message_at || '').getTime()
    );

    return { data: conversationsList, error: null };
  },
  
  // Récupérer les messages d'une conversation spécifique
  getMessages: async (userId: string, otherUserId: string) => {
    // Éviter de récupérer des messages avec soi-même
    if (userId === otherUserId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('Messages')
      .select(`
        id,
        sender_id,
        recipient_id,
        content,
        created_at,
        is_read
      `)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at');

    return { data, error };
  },
  
  // Envoyer un nouveau message
  sendMessage: async (senderId: string, recipientId: string, content: string) => {
    // Empêcher d'envoyer des messages à soi-même
    if (senderId === recipientId) {
      return { data: null, error: { message: 'Impossible d\'envoyer un message à soi-même' } };
    }

    const { data, error } = await supabase
      .from('Messages')
      .insert([
        {
          sender_id: senderId,
          recipient_id: recipientId,
          content,
          is_read: false
        }
      ])
      .select();

    // Ne plus créer de notifications automatiques
    return { data, error };
  },

  // Marquer des messages comme lus
  markAsRead: async (userId: string, otherUserId: string) => {
    const { data, error } = await supabase
      .from('Messages')
      .update({ is_read: true })
      .eq('sender_id', otherUserId)
      .eq('recipient_id', userId)
      .eq('is_read', false);

    return { data, error };
  },
  
  // Vérifier si deux utilisateurs peuvent échanger des messages
  // Maintenant permet à tous les utilisateurs de s'envoyer des messages
  canMessage: async (userId: string, otherUserId: string) => {
    // Empêcher de se parler à soi-même
    if (userId === otherUserId) {
      return { canMessage: false, error: null };
    }

    // Pour l'instant, autoriser tous les utilisateurs à communiquer
    // Vous pouvez ajouter des restrictions plus tard si nécessaire
    return { canMessage: true, error: null };
  },

  // Ajouter cette méthode au messageService

  // Compter le nombre total de messages non lus
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('Messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
      
    return { count, error };
  },

  // Rechercher les utilisateurs avec qui on peut échanger des messages
  searchMessagableUsers: async (userId: string, searchQuery: string = '') => {
    try {
      // Rechercher parmi tous les utilisateurs, pas seulement les abonnements mutuels
      let query = supabase
        .from('Profile')
        .select('id, nickname, profilePicture')
        .neq('id', userId); // Exclure soi-même

      // Filtrer par la recherche si fournie
      if (searchQuery.trim()) {
        const queryText = searchQuery.toLowerCase();
        query = query.ilike('nickname', `%${queryText}%`);
      }

      const { data: users, error } = await query.limit(50);

      if (error) throw error;

      return { data: users || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },
};