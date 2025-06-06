// src/services/stripe.ts
import Stripe from 'stripe';
import  supabase  from '@/lib/supabase';

// Vérifiez que la clé API Stripe est définie
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY est manquant');
}

// Initialisation de l'instance Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil', // Utilisez la dernière version de l'API
});

export const stripeService = {
  // Créer un client Stripe pour l'utilisateur
  createCustomer: async (profileId: string, email: string, name: string) => {
    try {
      // Vérifier si le client existe déjà
      const { data: existingCustomer } = await supabase
        .from('Subscriptions')
        .select('customer_id')
        .eq('profile_id', profileId)
        .single();

      if (existingCustomer?.customer_id) {
        return { customerId: existingCustomer.customer_id };
      }

      // Créer un nouveau client Stripe
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { profileId }
      });

      // Enregistrer l'ID client dans Supabase
      await supabase
        .from('Subscriptions')
        .insert({
          profile_id: profileId,
          customer_id: customer.id,
          plan: 'free',
          status: 'active'
        });

      return { customerId: customer.id };
    } catch (error) {
      console.error('Erreur lors de la création du client Stripe:', error);
      throw error;
    }
  },

  // Créer une session de paiement
  createCheckoutSession: async (profileId: string, priceId: string, customerId: string) => {
    try {
      // Créer une session de checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/cancel`,
        metadata: {
          profileId
        }
      });

      return { sessionId: session.id, sessionUrl: session.url };
    } catch (error) {
      console.error('Erreur lors de la création de la session de checkout:', error);
      throw error;
    }
  },

  // Récupérer les détails d'un abonnement
  getSubscription: async (subscriptionId: string) => {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return { subscription };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  },

  // Annuler un abonnement
  cancelSubscription: async (subscriptionId: string) => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });
      return { success: true, subscription };
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      throw error;
    }
  },

  // Réactiver un abonnement annulé
  reactivateSubscription: async (subscriptionId: string) => {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });
      return { success: true, subscription };
    } catch (error) {
      console.error('Erreur lors de la réactivation de l\'abonnement:', error);
      throw error;
    }
  }
};