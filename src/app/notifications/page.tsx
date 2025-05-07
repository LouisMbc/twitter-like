"use client";

import { useState } from 'react';
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
    FaPlus
} from 'react-icons/fa';
// Import Footer component
import Footer from '@/components/shared/Footer';

export default function NotificationsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('tous');

    // Mock data for notifications
    const notifications = Array(3).fill({
        username: 'Pseudo_utilisateur',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy...'
    });

    return (
        <div className="min-h-screen flex flex-col bg-black text-white">
            <div className="flex flex-1">
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
                    {/* Header */}
                    <div className="sticky top-0 bg-black z-10 p-4 border-b border-gray-800">
                        <h1 className="text-xl font-bold">Notifications</h1>

                        {/* Search bar */}
                        <div className="mt-2">
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

                    {/* Tabs */}
                    <div className="border-b border-gray-800">
                        <div className="flex">
                            <button
                                className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === 'tous' ? 'border-b-2 border-red-500' : ''}`}
                                onClick={() => setActiveTab('tous')}
                            >
                                Tous
                            </button>
                            <button
                                className={`flex-1 px-4 py-3 text-center font-medium ${activeTab === 'mention' ? 'border-b-2 border-red-500' : ''}`}
                                onClick={() => setActiveTab('mention')}
                            >
                                Mention
                            </button>
                        </div>
                    </div>

                    {/* Notifications feed */}
                    <div className="divide-y divide-gray-800">
                        {notifications.map((notification, index) => (
                            <div key={index} className="p-4 hover:bg-gray-900/50 transition-colors">
                                <div className="flex">
                                    {/* User avatar */}
                                    <div className="mr-3">
                                        <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                                            <FaUser className="text-gray-300" />
                                        </div>
                                    </div>

                                    {/* Notification content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold">{notification.username}</span>
                                            <button className="text-gray-400">
                                                <FaEllipsisH />
                                            </button>
                                        </div>
                                        <p className="text-gray-300 mt-1">{notification.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Footer component */}
            <div className="ml-[250px]">
                <Footer />
            </div>
        </div>
    );
}
