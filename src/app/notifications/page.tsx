// src/app/notifications/page.tsx
"use client";

import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, error, markAllAsRead, markAsRead } = useNotifications();
  const router = useRouter();
  
  useAuth(); // Protection de la route
  
  // Déterminer l'URL de redirection en fonction du type de notification
  const getNotificationUrl = (notification) => {
    switch (notification.content_type) {
      case 'tweet':
        return `/tweets/${notification.content_id}`;
      case 'story':
        return `/profile/${notification.sender.id}`;
      case 'follow':
        return `/profile/${notification.sender.id}`;
      case 'like':
      case 'retweet':
        return `/tweets/${notification.content_id}`;
      default:
        return '#';
    }
  };
  
  // Formater la date
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM HH:mm', { locale: fr });
  };
  
  // Marquer une notification comme lue et naviguer vers la cible
  const handleNotificationClick = async (notification) => {
    // Si la notification n'est pas lue, la supprimer
    if (!notification.is_read) {
      // D'abord naviguer pour une expérience utilisateur fluide
      router.push(getNotificationUrl(notification));
      // Puis supprimer la notification (la marque comme lue puis la supprime)
      await markAsRead(notification.id);
    } else {
      // Si elle est déjà lue, simplement naviguer
      router.push(getNotificationUrl(notification));
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-center">Chargement de vos notifications...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button 
            onClick={() => {
              markAllAsRead();
              // Redirection vers la page actuelle pour rafraîchir la vue
              // après un petit délai pour permettre à l'API de traiter la demande
              setTimeout(() => router.refresh(), 300);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 flex items-center"
          >
            <CheckIcon className="h-5 w-5 mr-2" />
            Tout marquer comme lu
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg">Vous n'avez pas encore de notifications</p>
          <p className="text-sm mt-2">Les activités comme les nouveaux tweets, stories et suivis apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          {notifications.map((notification) => (
            <div 
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b last:border-b-0 flex items-start space-x-4 cursor-pointer transition hover:bg-gray-50 ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex-shrink-0">
                <Image 
                  src={notification.sender.profilePicture || '/default-avatar.png'}
                  alt={notification.sender.nickname}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div className="flex-grow">
                <p className="text-gray-800">
                  <span className="font-semibold">{notification.sender.nickname}</span>
                  {' '}
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNotificationDate(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}