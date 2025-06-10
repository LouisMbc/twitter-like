// src/app/premium/cancel/page.tsx
"use client";

import { useRouter } from 'next/navigation';
import { XCircleIcon } from '@heroicons/react/24/outline';
import Header from '@/components/shared/Header';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      <div className="ml-64 flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-8 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-6">
            <XCircleIcon className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Abonnement non complété</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Le processus d'abonnement a été annulé ou interrompu. Aucun paiement n'a été effectué.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.push('/premium')}
              className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow focus:outline-none transition-colors duration-300"
            >
              Réessayer
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg shadow focus:outline-none transition-colors duration-300"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}