// src/app/premium/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePremium } from '@/hooks/usePremium';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';
import Header from '@/components/shared/Header';

export default function PremiumPage() {
  const router = useRouter();
  const { isPremium, subscriptionData, loading, error, subscribeToPermium, cancelSubscription, reactivateSubscription } = usePremium();
  const { profile } = useProfile();
  const [isProcessing, setIsProcessing] = useState(false);

  // Protéger la page
  useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex bg-black text-white">
        <Header />
        <div className="ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">Chargement de votre abonnement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <Header />
      <div className="ml-64 flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Twitter-like Premium</h1>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-white">
              <h2 className="text-2xl font-bold mb-2">Débloquez toutes les fonctionnalités premium</h2>
              <p className="opacity-90">Profitez d'une expérience sans limite sur Twitter-like</p>
            </div>
            
            <div className="p-6 space-y-6">
              {isPremium ? (
                <>
                  <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span>Vous êtes abonné à Twitter-like Premium !</span>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de votre abonnement</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Statut</p>
                        <p className="capitalize text-gray-900 dark:text-white">{subscriptionData?.status || 'Actif'}</p>
                      </div>
                      
                      {subscriptionData?.current_period_end && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Renouvellement prévu</p>
                          <p className="text-gray-900 dark:text-white">{formatDistance(new Date(subscriptionData.current_period_end), new Date(), { addSuffix: true, locale: fr })}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fonctionnalités premium activées</h3>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>Tweets illimités</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>Priorité dans les fils d'actualité</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>Accès aux stories exclusives</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span>Navigation sans publicité</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    {subscriptionData?.cancel_at_period_end ? (
                      <>
                        <div className="mb-4 bg-yellow-900 border border-yellow-700 text-yellow-200 px-4 py-3 rounded">
                          <p>Votre abonnement sera annulé à la fin de la période en cours. Vous pouvez le réactiver à tout moment.</p>
                        </div>
                        <button
                          onClick={async () => {
                            setIsProcessing(true);
                            await reactivateSubscription();
                            setIsProcessing(false);
                          }}
                          disabled={isProcessing}
                          className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                        >
                          {isProcessing ? 'Traitement en cours...' : 'Réactiver l\'abonnement'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={async () => {
                          setIsProcessing(true);
                          await cancelSubscription();
                          setIsProcessing(false);
                        }}
                        disabled={isProcessing}
                        className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                      >
                        {isProcessing ? 'Traitement en cours...' : 'Annuler l\'abonnement'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">Devenez Premium</h3>
                  <p className="text-gray-400">Pour seulement 9,99€/mois, vous bénéficiez de :</p>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Tweets illimités (vs limite de 5 tweets/jour pour les utilisateurs standards)</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Vos tweets apparaissent en priorité dans les fils d'actualité</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Accès aux stories exclusives de créateurs premium</span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <span>Navigation sans publicité</span>
                    </li>
                  </ul>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mt-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Twitter-like Premium</span>
                      <span className="font-bold">9,99€/mois</span>
                    </div>
                    <p className="text-sm text-gray-400">Annulation possible à tout moment</p>
                  </div>
                  
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      await subscribeToPermium();
                    }}
                    disabled={isProcessing || !profile}
                    className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                  >
                    {isProcessing ? 'Redirection vers le paiement...' : 'S\'abonner maintenant'}
                  </button>
                  
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Paiement sécurisé via Stripe. Aucun engagement, annulable à tout moment.
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Section test cards */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mt-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Cartes de test Stripe</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-300">Utilisez ces numéros de carte pour tester l'intégration de paiement:</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3">Numéro de carte</th>
                    <th className="px-6 py-3">Date d'expiration</th>
                    <th className="px-6 py-3">CVC</th>
                    <th className="px-6 py-3">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">4242 4242 4242 4242</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Toute date future</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Trois chiffres</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400">Paiement réussi</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">4000 0027 6000 3184</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Toute date future</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Trois chiffres</td>
                    <td className="px-6 py-4 text-yellow-600 dark:text-yellow-400">3D Secure requis</td>
                  </tr>
                  <tr className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">4000 0000 0000 9995</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Toute date future</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">Trois chiffres</td>
                    <td className="px-6 py-4 text-red-600 dark:text-red-400">Paiement refusé</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}