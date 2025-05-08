"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from "@/components/layout/Sidebar";
import SearchBar from "@/components/searchBar/SearchBar";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
    profilePicture?: string;
    profileId?: string;
    profileName?: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tous' | 'mention'>('tous');

    useEffect(() => {
        // Mock fetching notifications
        // Replace with actual API call
        setTimeout(() => {
            const mockNotifications = [
                {
                    id: "1",
                    message: "Someone liked your post",
                    timestamp: new Date().toISOString(),
                    read: false,
                    profilePicture: "/default-avatar.png",
                    profileId: "1",
                    profileName: "Pseudo_utilisateur"
                },
                {
                    id: "2",
                    message: "New follower",
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                    profilePicture: "/default-avatar.png",
                    profileId: "2",
                    profileName: "Pseudo_utilisateur"
                },
                {
                    id: "3",
                    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor.",
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    read: true,
                    profilePicture: "/default-avatar.png",
                    profileId: "3",
                    profileName: "Pseudo_utilisateur"
                },
            ];
            setNotifications(mockNotifications);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="flex min-h-screen bg-white dark:bg-gray-900 dark:text-white">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content */}
            <div className="flex-1 ml-64">
                {/* Top header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 py-2 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-md">
                        <SearchBar />
                    </div>
                    <div className="flex items-center">
                        <ThemeToggle />
                    </div>
                </div>
                
                {/* Notifications content */}
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold mb-4">Notifications</h1>
                    
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'tous' ? 'border-b-2 border-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('tous')}
                        >
                            Tous
                        </button>
                        <button
                            className={`py-2 px-4 font-medium ${activeTab === 'mention' ? 'border-b-2 border-red-500' : 'text-gray-500 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('mention')}
                        >
                            Mention
                        </button>
                    </div>
                    
                    {/* Notifications list */}
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={`p-4 ${notification.read ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}
                                >
                                    <div className="flex">
                                        <div className="mr-3 flex-shrink-0">
                                            {notification.profilePicture && (
                                                <Link href={`/profile/${notification.profileId}`}>
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        <img
                                                            src={notification.profilePicture}
                                                            alt={notification.profileName || "User"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                </Link>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                {notification.profileName && (
                                                    <Link href={`/profile/${notification.profileId}`} className="hover:underline">
                                                        {notification.profileName}
                                                    </Link>
                                                )}
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200">{notification.message}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            Aucune notification pour le moment.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}