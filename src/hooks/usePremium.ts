// src/hooks/usePremium.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { loadStripe } from '@stripe/stripe-js';
import { Subscription } from '@/types'; // Importez le type Subscription

// Initialiser la promesse Stripe en dehors du hook
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export const usePremium = () => {
  const router = useRouter();
  const { profile } = useProfile();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  // Définir le type correct pour subscriptionData
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(null);
  const [error, setError] = useState('');

  // Récupérer le statut de l'abonnement
  const fetchSubscriptionStatus = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      // Vérifier le statut premium dans le profil
      setIsPremium(!!profile.is_premium);
      
      // Récupérer les détails de l'abonnement
      const { data, error } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Ajouter le casting explicite ici
      setSubscriptionData(data as Subscription | null);
    } catch (err) {
      console.error('Erreur lors de la récupération du statut de l\'abonnement:', err);
      setError('Impossible de vérifier le statut de votre abonnement');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Rediriger vers la page de checkout Stripe
  const subscribeToPermium = async () => {
    try {
      setLoading(true);
      
      // S'assurer que l'utilisateur est connecté et a un profil
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Veuillez vous connecter pour vous abonner");
      
      // Récupérer le profil
      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (!profileData) throw new Error("Profil non trouvé");
      
      // Appel à votre API de checkout
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileData.id
        }),
      });
      
      // Vérifier si la réponse est ok avant de tenter de la parser
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Statut de la réponse:', response.status);
        console.error('Texte d\'erreur complet:', errorText);
        throw new Error(`Erreur lors de la création de la session: ${response.statusText}`);
      }
      
      // Parse la réponse en JSON
      const data = await response.json();
      
      // Rediriger vers l'URL de checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Erreur lors de l'abonnement:", error);
      setError(error instanceof Error ? error.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Annuler l'abonnement
  const cancelSubscription = async () => {
    if (!subscriptionData?.subscription_id) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscriptionData.subscription_id })
      });
      
      const { error: apiError } = await response.json();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      // Rafraîchir les données
      fetchSubscriptionStatus();
    } catch (err) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err);
      setError('Impossible d\'annuler votre abonnement');
    } finally {
      setLoading(false);
    }
  };

  // Réactiver l'abonnement
  const reactivateSubscription = async () => {
    if (!subscriptionData?.subscription_id) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscriptionData.subscription_id })
      });
      
      const { error: apiError } = await response.json();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      // Rafraîchir les données
      fetchSubscriptionStatus();
    } catch (err) {
      console.error('Erreur lors de la réactivation de l\'abonnement:', err);
      setError('Impossible de réactiver votre abonnement');
    } finally {
      setLoading(false);
    }
  };

  // Charger le statut au démarrage
  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  return {
    isPremium,
    subscriptionData,
    loading,
    error,
    subscribeToPermium,
    cancelSubscription,
    reactivateSubscription,
    refreshSubscriptionStatus: fetchSubscriptionStatus
  };
};