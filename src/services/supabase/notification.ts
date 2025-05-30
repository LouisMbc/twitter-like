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
  }
};