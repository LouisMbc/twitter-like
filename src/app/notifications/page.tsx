"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaSearch, 
  FaBell, 
  FaEnvelope, 
  FaUser,
  FaEllipsisH,
  FaPlus,
  FaArrowLeft
} from 'react-icons/fa';

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
        <div className="min-h-screen flex bg-black text-white">
            {/* Left Sidebar */}
            <div className="w-[250px] p-4 border-r border-gray-800 flex flex-col h-screen fixed left-0">
                <div className="mb-8">
                    <Link href="/">
                        <Image
                            src="/logo_Flow.png"
                            alt="Flow Logo"
                            width={100}
                            height={50}
                            className="object-contain"
                        />
                    </Link>
                </div>

                <nav className="flex-1">
                    <ul className="space-y-4">
                        <li>
                            <Link href="/dashboard" className="flex items-center p-2 rounded-full hover:bg-gray-800">
                                <FaHome className="mr-4 text-2xl" />
                                <span className="text-xl">Accueil</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/explore" className="flex items-center p-2 rounded-full hover:bg-gray-800">
                                <FaSearch className="mr-4 text-2xl" />
                                <span className="text-xl">Explorer</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/notifications" className="flex items-center p-2 rounded-full bg-gray-800">
                                <FaBell className="mr-4 text-2xl" />
                                <span className="text-xl">Notifications</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/messages" className="flex items-center p-2 rounded-full hover:bg-gray-800">
                                <FaEnvelope className="mr-4 text-2xl" />
                                <span className="text-xl">Messages</span>
                            </Link>
                        </li>
                        <li>
                            <Link href="/profile" className="flex items-center p-2 rounded-full hover:bg-gray-800">
                                <FaUser className="mr-4 text-2xl" />
                                <span className="text-xl">Profil</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Add post button */}
                <div className="mt-4 mb-8">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium rounded-full py-3 flex items-center justify-center">
                        <FaPlus className="mr-2" />
                        Ajouter un post
                    </button>
                </div>

                {/* User profile at bottom */}
                <div className="flex items-center p-2 rounded-full hover:bg-gray-800 cursor-pointer">
                    <div className="w-10 h-10 bg-gray-500 rounded-full mr-3 flex items-center justify-center">
                        <span>VP</span>
                    </div>
                    <span className="flex-1">Votre_pseudo</span>
                    <FaEllipsisH />
                </div>
            </div>

            {/* Main content area */}
            <div className="ml-[250px] flex-1">
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
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'tous' ? 'border-b-2 border-red-500' : ''}`}
                            onClick={() => setActiveTab('tous')}
                        >
                            Tous
                        </button>
                        <button
                            className={`px-4 py-3 text-sm font-medium ${activeTab === 'mention' ? 'border-b-2 border-red-500' : ''}`}
                            onClick={() => setActiveTab('mention')}
                        >
                            Mention
                        </button>
                    </div>
                </div>
                
                {/* Notifications list */}
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {notifications.map((notification) => (
                            <div 
                                key={notification.id}
                                className={`p-4 hover:bg-gray-900/50 transition-colors ${notification.read ? '' : 'bg-gray-900/30'}`}
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
                                        <div className="font-medium">
                                            {notification.profileName && (
                                                <Link href={`/profile/${notification.profileId}`} className="hover:underline">
                                                    {notification.profileName}
                                                </Link>
                                            )}
                                        </div>
                                        <p className="text-gray-300">{notification.message}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {new Date(notification.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    {/* Three dots menu button */}
                                    <div className="ml-2">
                                        <button className="text-gray-500 hover:text-gray-300 p-1">
                                            <FaEllipsisH />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        Aucune notification pour le moment.
                    </div>
                )}
            </div>
        </div>
    );
}