// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/supabase/notification';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase';

interface Sender {
  id: string;
  nickname: string;
  profilePicture?: string;
}

interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  content_id?: string;
  content_type: 'tweet' | 'story' | 'follow' | 'like' | 'retweet' | 'message' | 'mention';
  type: 'like' | 'retweet' | 'follow' | 'mention' | 'comment' | 'new_tweet';
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: Sender[];
}

export const useNotifications = () => {
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await notificationService.getNotifications(profile.id);
      if (error) throw error;

      const cleanedNotifications = (data || []).map((notif: Notification) => ({
        ...notif,
        sender: notif.sender?.map((sender: Sender) => ({
          ...sender,
          nickname: sender.nickname?.startsWith('@') ? sender.nickname : sender.nickname
        })) || []
      }));

      setNotifications(cleanedNotifications);
      setUnreadCount(cleanedNotifications.filter(notif => !notif.is_read).length);
    } catch {
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!profile) return;

    try {
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      
      await notificationService.markAsRead(notificationId);
    } catch {
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!profile) return;

    try {
      const { error } = await notificationService.markAllAsRead(profile.id);
      if (error) throw error;

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true } as Notification)));
      setUnreadCount(0);
    } catch {
      // Erreur lors du marquage comme lu
    }
  }, [profile]);

  const likePostFromNotification = useCallback(async (tweetId: string) => {
    if (!profile) return false;

    try {
      await notificationService.likePostFromNotification(profile.id, tweetId);
      return true;
    } catch {
      return false;
    }
  }, [profile]);

  const blockNotificationsFromUser = useCallback(async (senderId: string) => {
    if (!profile) return false;

    try {
      const { error } = await notificationService.blockNotificationsFromUser(profile.id, senderId);
      if (error) throw new Error(String(error));
      
      setNotifications(prev => prev.filter(notif => notif.sender?.[0]?.id !== senderId));
      
      return true;
    } catch {
      return false;
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Notifications',
        filter: `user_id=eq.${profile.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile, fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    likePostFromNotification,
    blockNotificationsFromUser
  };
};