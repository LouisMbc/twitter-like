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

export default function ExplorePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('pour-vous');
  
  // Mock data for recommendations
  const recommendations = Array(6).fill({
    tag: '#Kanye West',
    publications: '107.3k publications'
  });

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
              <Link href="/" className="flex items-center p-2 rounded-full hover:bg-gray-800">
                <FaHome className="mr-4 text-2xl" />
                <span className="text-xl">Accueil</span>
              </Link>
            </li>
            <li>
              <Link href="/explore" className="flex items-center p-2 rounded-full bg-gray-800">
                <FaSearch className="mr-4 text-2xl" />
                <span className="text-xl">Explorer</span>
              </Link>
            </li>
            <li>
              <Link href="/notifications" className="flex items-center p-2 rounded-full hover:bg-gray-800">
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

        {/* Navigation tabs */}
        <div className="border-b border-gray-800">
          <div className="flex justify-between overflow-x-auto">
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'pour-vous' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => setActiveTab('pour-vous')}
            >
              Pour vous
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'tendances' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => setActiveTab('tendances')}
            >
              Tendances
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'actualites' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => setActiveTab('actualites')}
            >
              Actualités
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'sport' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => setActiveTab('sport')}
            >
              Sport
            </button>
            <button 
              className={`px-4 py-3 text-sm font-medium ${activeTab === 'divertissement' ? 'border-b-2 border-red-500' : ''}`}
              onClick={() => setActiveTab('divertissement')}
            >
              Divertissement
            </button>
          </div>
        </div>

        {/* Recommendation feed */}
        <div className="divide-y divide-gray-800">
          {recommendations.map((rec, index) => (
            <div key={index} className="p-4 hover:bg-gray-900/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-400">Recommandation pour vous</p>
                  <p className="font-bold">{rec.tag}</p>
                  <p className="text-sm text-gray-400">{rec.publications}</p>
                </div>
                <button className="text-gray-400">
                  <FaEllipsisH />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
