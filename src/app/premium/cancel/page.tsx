// src/app/premium/cancel/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-8 text-center border border-gray-700">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-900 mb-6">
          <XCircleIcon className="h-10 w-10 text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Abonnement non complété</h1>
        
        <p className="text-gray-300 mb-6">
          Le processus d'abonnement a été annulé ou interrompu. Aucun paiement n'a été effectué.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/premium')}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow focus:outline-none"
          >
            Réessayer
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg shadow focus:outline-none"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}