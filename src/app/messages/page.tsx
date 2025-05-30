// src/app/messages/page.tsx
"use client";

import { useProfile } from '@/hooks/useProfile';
import ConversationList from '@/components/messages/ConversationList';
import { MagnifyingGlassIcon, PencilSquareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const { profile, loading } = useProfile();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <div className="mt-4">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Accès non autorisé</h2>
          <p className="text-gray-400">Veuillez vous connecter pour accéder à vos messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col h-screen">
        {/* Header avec flèche de retour */}
        <div className="p-4 border-b border-gray-800 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex-1">Messages</h1>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher des messages"
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>
      </div>
    </div>
  );
}