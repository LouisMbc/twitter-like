// src/app/messages/page.tsx
"use client";

import { useProfile } from '@/hooks/useProfile';
import ConversationList from '@/components/messages/ConversationList';
import Sidebar from '@/components/layout/Sidebar';

export default function MessagesPage() {
  const { profile, loading } = useProfile();

  if (loading) {
    return <div className="p-4 text-center text-gray-300 bg-black">Chargement...</div>;
  }

  if (!profile) {
    return <div className="p-4 text-center text-gray-300 bg-black">Veuillez vous connecter pour accéder à vos messages.</div>;
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      <Sidebar />
      
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto bg-black text-white rounded-lg shadow border-gray-800 border">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-gray-900 border border-gray-700 rounded-full px-4 py-1 text-sm text-white"
              />
            </div>
          </div>
          <ConversationList />
        </div>
      </div>
    </div>
  );
}