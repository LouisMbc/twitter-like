// src/services/supabase/notification.ts
import supabase from '@/lib/supabase';

export const notificationService = {
  // Récupérer les notifications d'un utilisateur
  getNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('Notifications')
      .select(`
        id,
        content_id,
        content_type,
        type,
        message,
        is_read,
        created_at,
        sender:sender_id (
          id,
          nickname,
          profilePicture
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Nettoyer les nicknames des expéditeurs pour éviter les @ doubles
    if (data) {
      data.forEach(notification => {
        if (notification.sender && notification.sender.nickname) {
          // Supprimer tous les @ en début de nickname
          notification.sender.nickname = notification.sender.nickname.replace(/^@+/, '');
        }
      });
    }

    return { data, error };
  },

  // Récupérer le nombre de notifications non lues
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('Notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { count: count || 0, error };
  },

  // Marquer une notification comme lue puis la supprimer
  markAsRead: async (notificationId: string) => {
    // D'abord, marquer comme lue (pour conserver la cohérence de l'interface)
    const { error: readError } = await supabase
      .from('Notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    if (readError) return { error: readError };
    
    // Puis supprimer la notification
    const { data, error } = await supabase
      .from('Notifications')
      .delete()
      .eq('id', notificationId)
      .select();

    return { data, error };
  },

  // Marquer toutes les notifications comme lues
  markAllAsRead: async (userId: string) => {
    const { data, error } = await supabase
      .from('Notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { data, error };
  },

  // Créer une notification (utilisée par les hooks)
  createNotification: async (notification: {
    user_id: string;
    sender_id: string;
    content_id?: string;
    content_type: 'tweet' | 'story' | 'follow' | 'like' | 'retweet' | 'message';
    type: string;
    message: string;
  }) => {
    const { data, error } = await supabase
      .from('Notifications')
      .insert([notification])
      .select();

    return { data, error };
  },

  // Créer une notification automatique pour les likes
  createLikeNotification: async (tweetId: string, tweetAuthorId: string, likerId: string) => {
    // Ne pas notifier si on like son propre tweet
    if (tweetAuthorId === likerId) return;

    try {
      const { data: likerProfile } = await supabase
        .from('Profile')
        .select('nickname')
        .eq('id', likerId)
        .single();

      const likerNickname = likerProfile?.nickname || 'Quelqu\'un';

      const { data, error } = await supabase
        .from('Notifications')
        .insert([{
          user_id: tweetAuthorId,
          sender_id: likerId,
          content_id: tweetId,
          content_type: 'like',
          type: 'like',
          message: `@${likerNickname} a aimé votre tweet`,
          is_read: false
        }])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création de la notification de like:', error);
      return { data: null, error };
    }
  },

  // Créer une notification automatique pour les retweets
  createRetweetNotification: async (originalTweetId: string, originalAuthorId: string, retweeterId: string) => {
    // Ne pas notifier si on retweet son propre tweet
    if (originalAuthorId === retweeterId) return;

    try {
      const { data: retweeterProfile } = await supabase
        .from('Profile')
        .select('nickname')
        .eq('id', retweeterId)
        .single();

      const retweeterNickname = retweeterProfile?.nickname || 'Quelqu\'un';

      const { data, error } = await supabase
        .from('Notifications')
        .insert([{
          user_id: originalAuthorId,
          sender_id: retweeterId,
          content_id: originalTweetId,
          content_type: 'retweet',
          type: 'retweet',
          message: `@${retweeterNickname} a retweeté votre tweet`,
          is_read: false
        }])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création de la notification de retweet:', error);
      return { data: null, error };
    }
  },

  // Créer une notification automatique pour les abonnements
  createFollowNotification: async (followedUserId: string, followerId: string) => {
    // Ne pas notifier si on se suit soi-même (impossible normalement)
    if (followedUserId === followerId) return;

    try {
      const { data: followerProfile } = await supabase
        .from('Profile')
        .select('nickname')
        .eq('id', followerId)
        .single();

      const followerNickname = followerProfile?.nickname || 'Quelqu\'un';

      const { data, error } = await supabase
        .from('Notifications')
        .insert([{
          user_id: followedUserId,
          sender_id: followerId,
          content_type: 'follow',
          type: 'follow',
          message: `@${followerNickname} a commencé à vous suivre`,
          is_read: false
        }])
        .select();

      return { data, error };
    } catch (error) {
      console.error('Erreur lors de la création de la notification de suivi:', error);
      return { data: null, error };
    }
  },

  // Supprimer les notifications de test
  removeTestNotifications: async () => {
    try {
      const { error } = await supabase
        .from('Notifications')
        .delete()
        .or('message.ilike.%Test notification%,message.ilike.%notification de test%,message.ilike.%Test%');

      return { error };
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications de test:', error);
      return { error };
    }
  },

  // Nouvelle fonction pour supprimer toutes les notifications d'un utilisateur
  clearAllNotifications: async (userId: string) => {
    try {
      const { error } = await supabase
        .from('Notifications')
        .delete()
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      console.error('Erreur lors de la suppression des notifications:', error);
      return { error };
    }
  },
};