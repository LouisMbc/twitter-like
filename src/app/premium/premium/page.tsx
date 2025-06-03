// src/app/premium/success/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Header from '@/components/shared/Header';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier que la session ID est présente
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      router.push('/premium');
      return;
    }
    
    // Vérifier le statut du paiement auprès de Stripe
    const verifyPayment = async () => {
      try {
        const response = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        
        const { success, error } = await response.json();
        
        if (!success) {
          console.error('Erreur lors de la vérification du paiement:', error);
          router.push('/premium?error=payment_verification_failed');
          return;
        }
        
        setLoading(false);
        
        // Rediriger vers la page premium après un délai
        setTimeout(() => {
          router.push('/premium');
        }, 5000);
      } catch (err) {
        console.error('Erreur:', err);
        router.push('/premium?error=unexpected_error');
      }
    };
    
    verifyPayment();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
        <Header />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
            <h2 className="mt-4 text-xl">Vérification de votre paiement...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      <div className="ml-64 flex-1 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-8 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Paiement réussi !</h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Votre abonnement Twitter-like Premium a été activé avec succès. Vous allez maintenant profiter de toutes les fonctionnalités premium.
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Vous serez redirigé vers votre page d'abonnement dans quelques secondes...
          </p>
          
          <button
            onClick={() => router.push('/premium')}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow focus:outline-none transition-colors duration-300"
          >
            Voir mon abonnement
          </button>
        </div>
      </div>
    </div>
  );
}