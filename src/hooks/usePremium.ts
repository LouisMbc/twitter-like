// src/hooks/usePremium.ts
import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { Subscription } from '@/types';

export const usePremium = () => {
  const { profile } = useProfile();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<Subscription | null>(null);
  const [error, setError] = useState('');

  const fetchSubscriptionStatus = useCallback(async () => {
    if (!profile) return;

    setLoading(true);
    setError('');

    try {
      setIsPremium(!!(profile as Record<string, unknown>).is_premium);
      
      const { data, error } = await supabase
        .from('Subscriptions')
        .select('*')
        .eq('profile_id', profile.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setSubscriptionData(data as Subscription | null);
    } catch {
      setError('Impossible de vérifier le statut de votre abonnement');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const subscribeToPermium = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Veuillez vous connecter pour vous abonner");
      
      const { data: profileData } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
      
      if (!profileData) throw new Error("Profil non trouvé");
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profileData.id
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la création de la session: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      window.location.href = data.url;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la souscription');
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!subscriptionData) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscriptionData.subscription_id })
      });
      
      const { error: apiError } = await response.json();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      fetchSubscriptionStatus();
    } catch {
      setError('Impossible d\'annuler votre abonnement');
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    if (!subscriptionData) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscriptionData.subscription_id })
      });
      
      const { error: apiError } = await response.json();
      
      if (apiError) {
        throw new Error(apiError);
      }
      
      fetchSubscriptionStatus();
    } catch {
      setError('Impossible de réactiver votre abonnement');
    } finally {
      setLoading(false);
    }
  };

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