"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaEllipsisH } from 'react-icons/fa';
import Header from '@/components/shared/Header';

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
