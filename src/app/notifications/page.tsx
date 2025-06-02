"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { FaSearch, FaEllipsisH } from 'react-icons/fa';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import supabase from '@/lib/supabase-browser';

interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'like' | 'comment' | 'follow' | 'mention' | 'new_post';
    profilePicture?: string;
    profileId?: string;
    profileName?: string;
    postId?: string;
    fromUserId: string;
    toUserId: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tous' | 'mention'>('tous');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Get current user
    useEffect(() => {
        const getCurrentUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        getCurrentUser();
    }, []);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!currentUserId) return;

        try {
            const { data, error } = await supabase
                .from('Notifications')
                .select(`
                    *,
                    from_profile:from_user_id (
                        nickname,
                        profilePicture
                    ),
                    post:post_id (
                        content
                    )
                `)
                .eq('to_user_id', currentUserId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erreur lors de la récupération des notifications:', error);
                return;
            }

            const formattedNotifications: Notification[] = data.map(notif => ({
                id: notif.id,
                message: generateNotificationMessage(notif),
                timestamp: notif.created_at,
                read: notif.read,
                type: notif.type,
                profilePicture: notif.from_profile?.profilePicture || '/default-avatar.png',
                profileId: notif.from_user_id,
                profileName: notif.from_profile?.nickname || 'Utilisateur inconnu',
                postId: notif.post_id,
                fromUserId: notif.from_user_id,
                toUserId: notif.to_user_id
            }));

            setNotifications(formattedNotifications);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate notification message based on type
    const generateNotificationMessage = (notif: any) => {
        const userName = notif.from_profile?.nickname || 'Un utilisateur';
        switch (notif.type) {
            case 'like':
                return `${userName} a aimé votre post`;
            case 'comment':
                return `${userName} a commenté votre post`;
            case 'follow':
                return `${userName} vous suit maintenant`;
            case 'mention':
                return `${userName} vous a mentionné dans un post`;
            case 'new_post':
                return `${userName} a publié un nouveau post`;
            default:
                return notif.message || 'Nouvelle notification';
        }
    };

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter(notification => {
        if (activeTab === 'mention') {
            return notification.type === 'mention';
        }
        return true; // 'tous' shows all notifications
    });

    useEffect(() => {
        if (currentUserId) {
            fetchNotifications();

            // Set up real-time subscription
            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'Notifications',
                        filter: `to_user_id=eq.${currentUserId}`
                    },
                    (payload) => {
                        console.log('Nouvelle notification reçue:', payload);
                        fetchNotifications(); // Refresh notifications
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'Notifications',
                        filter: `to_user_id=eq.${currentUserId}`
                    },
                    (payload) => {
                        console.log('Notification mise à jour:', payload);
                        fetchNotifications(); // Refresh notifications
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentUserId]);

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            await supabase
                .from('Notifications')
                .update({ read: true })
                .eq('id', notificationId);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, read: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Erreur lors du marquage comme lu:', error);
        }
    };

    return (
        <div className="min-h-screen flex bg-black text-white">
            <Header />

            {/* Main content area */}
            <div className="ml-64 flex-1">
                {/* Search bar */}
                <div className="sticky top-0 bg-black z-10 p-2 border-b border-gray-800">
                    <div className="max-w-md mx-auto relative">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="search"
                                className="block w-full pl-10 pr-3 py-2 rounded-full bg-gray-800 text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                                placeholder="Parcourir le flow..."
                            />
                        </div>
                    </div>
                </div>

                {/* Notification Tabs */}
                <div className="border-b border-gray-800">
                    <div className="flex overflow-x-auto">
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'tous' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('tous')}
                        >
                            Tous ({notifications.length})
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'mention' ? 'border-b-2 border-red-500 text-white' : 'text-gray-400'}`}
                            onClick={() => setActiveTab('mention')}
                        >
                            Mentions ({notifications.filter(n => n.type === 'mention').length})
                        </button>
                    </div>
                </div>
                
                {/* Notifications list */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`p-4 hover:bg-gray-900/50 transition-colors cursor-pointer ${notification.read ? '' : 'bg-gray-900/30 border-l-2 border-red-500'}`}
                                onClick={() => {
                                    if (!notification.read) {
                                        markAsRead(notification.id);
                                    }
                                    // Navigate to post if postId exists
                                    if (notification.postId) {
                                        router.push(`/post/${notification.postId}`);
                                    } else if (notification.type === 'follow') {
                                        router.push(`/profile/${notification.profileId}`);
                                    }
                                }}
                            >
                                <div className="flex">
                                    <div className="mr-3 flex-shrink-0">
                                        {notification.profilePicture && (
                                            <Link href={`/profile/${notification.profileId}`}>
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                                                    <img
                                                        src={notification.profilePicture}
                                                        alt={notification.profileName || "User"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {notification.profileName && (
                                                <Link href={`/profile/${notification.profileId}`} className="hover:underline font-medium">
                                                    {notification.profileName}
                                                </Link>
                                            )}
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-gray-300">{notification.message}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notification.timestamp).toLocaleString()}
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
                    <div className="text-center py-8 text-gray-500">
                        {activeTab === 'mention' 
                            ? 'Aucune mention pour le moment.' 
                            : 'Aucune notification pour le moment.'
                        }
                    </div>
                )}
            </div>
        </div>
    );
}