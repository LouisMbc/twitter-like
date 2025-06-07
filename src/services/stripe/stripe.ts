import Stripe from 'stripe';
import supabase from '@/lib/supabase';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY est manquant');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

export const stripeService = {
  createCustomer: async (profileId: string, email: string, name: string) => {
    try {
      const { data: existingCustomer } = await supabase
        .from('Subscriptions')
        .select('customer_id')
        .eq('profile_id', profileId)
        .single();

      if (existingCustomer?.customer_id) {
        return { customerId: existingCustomer.customer_id };
      }

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { profileId }
      });

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

  createCheckoutSession: async (profileId: string, priceId: string, customerId: string) => {
    try {
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

  getSubscription: async (subscriptionId: string) => {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return { subscription };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      throw error;
    }
  },

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