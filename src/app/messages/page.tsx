// src/app/messages/page.tsx
"use client";

import { useProfile } from '@/hooks/useProfile';
import ConversationList from '@/components/messages/ConversationList';

export default function MessagesPage() {
  const { profile, loading } = useProfile();

  if (loading) {
    return <div className="p-4 text-center">Chargement...</div>;
  }

  if (!profile) {
    return <div className="p-4 text-center">Veuillez vous connecter pour accéder à vos messages.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>
      <ConversationList />
    </div>
  );
}