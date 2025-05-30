// src/services/supabase/message.ts
import supabase from '@/lib/supabase';
import { notificationService } from './notification';

interface MessageUser {
  id: string;
  nickname: string;
  profilePicture: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: MessageUser;
  recipient?: MessageUser;
}

interface Conversation {
  user: MessageUser;
  lastMessage: Message;
  unreadCount: number;
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
    const conversations: Record<string, Conversation> = {};
    
    data?.forEach((message: any) => {
      const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;
      const recipient = Array.isArray(message.recipient) ? message.recipient[0] : message.recipient;
      
      const otherUserId = sender?.id === userId ? recipient?.id : sender?.id;
      const otherUser = sender?.id === userId ? recipient : sender;
      
      if (!otherUserId || !otherUser) return;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: otherUser,
          lastMessage: {
            ...message,
            sender,
            recipient
          },
          unreadCount: sender?.id !== userId && !message.is_read ? 1 : 0
        };
      } else if (new Date(message.created_at) > new Date(conversations[otherUserId].lastMessage.created_at)) {
        // Mettre à jour le dernier message s'il est plus récent
        conversations[otherUserId].lastMessage = {
          ...message,
          sender,
          recipient
        };
        // Incrémenter le compteur de non lus si nécessaire
        if (sender?.id !== userId && !message.is_read) {
          conversations[otherUserId].unreadCount++;
        }
      }
    });

    return { data: Object.values(conversations) };
  },

  // Récupérer les messages d'une conversation spécifique
  getMessages: async (userId: string, otherUserId: string) => {
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

    // Si le message est envoyé avec succès, créer une notification
    if (data && data[0]) {
      try {
        // Récupérer les informations de l'expéditeur pour le message de notification
        const { data: senderData } = await supabase
          .from('Profile')
          .select('nickname')
          .eq('id', senderId)
          .single();
        
        const senderName = senderData ? senderData.nickname : 'Un utilisateur';
        
        // Créer une notification pour le destinataire
        await notificationService.createNotification({
          user_id: recipientId,
          sender_id: senderId,
          content_id: data[0].id,
          content_type: 'message',
          type: 'new_message',
          message: `vous a envoyé un message`
        });
      } catch (notificationError) {
        console.error('Erreur lors de la création de la notification de message:', notificationError);
        // Ne pas faire échouer l'envoi du message si la notification échoue
      }
    }

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
  // (ils doivent se suivre mutuellement)
  canMessage: async (userId: string, otherUserId: string) => {
    // Vérifier si l'utilisateur suit l'autre
    const { data: follows, error: followsError } = await supabase
      .from('Following')
      .select('id')
      .eq('follower_id', userId)
      .eq('following_id', otherUserId)
      .single();

    if (followsError && followsError.code !== 'PGRST116') {
      return { canMessage: false, error: followsError };
    }

    // Vérifier si l'autre utilisateur suit l'utilisateur
    const { data: isFollowed, error: isFollowedError } = await supabase
      .from('Following')
      .select('id')
      .eq('follower_id', otherUserId)
      .eq('following_id', userId)
      .single();

    if (isFollowedError && isFollowedError.code !== 'PGRST116') {
      return { canMessage: false, error: isFollowedError };
    }

    const canMessage = !!follows && !!isFollowed;
    return { canMessage, error: null };
  },

  // Ajouter cette méthode au messageService

  // Compter le nombre total de messages non lus
  getUnreadCount: async (userId: string) => {
    const { data, count, error } = await supabase
      .from('Messages')
      .select('id', { count: 'exact' })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    return { count: count || 0, error };
  },
};