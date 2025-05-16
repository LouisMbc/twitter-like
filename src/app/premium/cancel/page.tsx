// src/app/premium/cancel/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <XCircleIcon className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Abonnement non complété</h1>
        
        <p className="text-gray-600 mb-6">
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
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg shadow focus:outline-none"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}