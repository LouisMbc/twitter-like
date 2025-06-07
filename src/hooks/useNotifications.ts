// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/services/supabase/notification';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase';

// Define the notification interface
interface Sender {
  id: string;
  nickname: string;
  profilePicture: string;
}

interface Notification {
  id: string;
  content_id: string;
  content_type: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender: Sender[];
}

export const useNotifications = () => {
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les notifications
  const fetchNotifications = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const { data, error } = await notificationService.getNotifications(profile.id);
      if (error) throw error;

      // Nettoyer les nicknames pour éviter les @ doubles
      const cleanedData = (data || []).map(notification => ({
        ...notification,
        sender: notification.sender ? {
          ...notification.sender,
          nickname: notification.sender.nickname?.replace(/^@+/, '') || ''
        } : null
      }));

      setNotifications(cleanedData as Notification[]);
      
      // Mettre à jour le compteur de notifications non lues
      const unreadNotifications = cleanedData.filter(notif => !notif.is_read);
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Impossible de charger vos notifications');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Supprimer localement la notification avant l'appel API pour une UX fluide
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
      
      // Appel au service pour supprimer la notification
      await notificationService.markAsRead(notificationId);
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
      // Recharger les notifications en cas d'erreur pour rétablir l'état correct
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!profile) return;

    try {
      const { error } = await notificationService.markAllAsRead(profile.id);
      if (error) throw error;

      // Mettre à jour localement
      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true } as Notification)));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur lors du marquage des notifications:', err);
    }
  }, [profile]);

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!profile) return;

    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Notifications',
        filter: `user_id=eq.${profile.id}`
      }, (payload) => {
        // Ajouter la nouvelle notification
        setNotifications(prev => [payload.new as Notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile]);

  // Charger les notifications au démarrage
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
};