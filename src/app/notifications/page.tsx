"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { FaSearch, FaEllipsisH } from 'react-icons/fa';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/shared/Header';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsPage() {
    const router = useRouter();
    const { notifications, unreadCount, loading, error, markAllAsRead, markAsRead } = useNotifications();
    const [activeTab, setActiveTab] = useState<'tous' | 'mention'>('tous');

    useAuth(); // Protection de la route

    // Déterminer l'URL de redirection en fonction du type de notification
    const getNotificationUrl = (notification: any) => {
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
    const formatNotificationDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'dd MMM HH:mm', { locale: fr });
    };

    // Marquer une notification comme lue et naviguer vers la cible
    const handleNotificationClick = async (notification: any) => {
        // Si la notification n'est pas lue, la marquer comme lue
        if (!notification.is_read) {
            await markAsRead(notification.id);
        }
        // Naviguer vers la cible
        router.push(getNotificationUrl(notification));
    };

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter((notification: any) => {
        if (activeTab === 'mention') {
            return notification.type === 'mention';
        }
        return true; // 'tous' shows all notifications
    });

    return (
        <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
            <Header />

            {/* Main content area */}
            <div className="ml-64 flex-1">
                {/* Search bar sans bouton thème */}
                <div className="sticky top-0 bg-white/80 dark:bg-black/80 z-10 p-2 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm transition-colors duration-300">
                    <div className="flex items-center justify-between gap-4 px-4">
                        <h1 className="text-2xl font-bold">Notifications</h1>
                        {unreadCount > 0 && (
                            <button 
                                onClick={() => {
                                    markAllAsRead();
                                    setTimeout(() => router.refresh(), 300);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center transition-colors duration-200"
                            >
                                <CheckIcon className="h-5 w-5 mr-2" />
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                </div>

                {/* Notification Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                    <div className="flex overflow-x-auto">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'tous' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('tous')}
                        >
                            Tous ({notifications.length})
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'mention' ? 'border-b-2 border-red-500 text-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('mention')}
                        >
                            Mentions ({notifications.filter((n: any) => n.type === 'mention').length})
                        </button>
                    </div>
                </div>
                
                {/* Notifications list */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">
                        {error}
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-800">
                        {filteredNotifications.map((notification: any) => (
                            <div 
                                key={notification.id}
                                className={`p-4 hover:bg-gray-100 dark:hover:bg-gray-900/50 transition-colors cursor-pointer ${!notification.is_read ? 'bg-red-50 dark:bg-gray-900/30 border-l-2 border-red-500' : ''}`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex">
                                    <div className="mr-3 flex-shrink-0">
                                        {notification.sender?.profilePicture && (
                                            <Link href={`/profile/${notification.sender.id}`}>
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                                                    <Image
                                                        src={notification.sender.profilePicture || '/default-avatar.png'}
                                                        alt={notification.sender.nickname || "User"}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {notification.sender?.nickname && (
                                                <Link href={`/profile/${notification.sender.id}`} className="hover:underline font-medium">
                                                    {notification.sender.nickname}
                                                </Link>
                                            )}
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300">{notification.message}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatNotificationDate(notification.created_at)}
                                        </p>
                                    </div>
                                    {/* Three dots menu button */}
                                    <div className="ml-2">
                                        <button 
                                            className="text-gray-500 hover:text-gray-300 p-1"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add menu functionality here
                                            }}
                                        >
                                            <FaEllipsisH />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-lg">
                            {activeTab === 'mention' 
                                ? 'Aucune mention pour le moment.' 
                                : 'Vous n\'avez pas encore de notifications'
                            }
                        </p>
                        <p className="text-sm mt-2">Les activités comme les nouveaux tweets, stories et suivis apparaîtront ici</p>
                    </div>
                )}
            </div>
        </div>
    );
}