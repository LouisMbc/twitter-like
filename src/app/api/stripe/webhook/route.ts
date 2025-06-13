// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import supabase from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Process subscription
        await processSubscription(session);
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Update subscription status
        await updateSubscriptionStatus(subscription);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Cancel subscription
        await cancelSubscription(subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function processSubscription(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profileId;
  
  if (!profileId) return;

  if (!session.subscription) return;

  const subscriptionId = typeof session.subscription === 'string' 
    ? session.subscription
    : session.subscription.id;

  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const { error } = await supabase
    .from('Subscriptions')
    .upsert({
      profile_id: profileId,
      subscription_id: subscriptionId,
      plan: 'premium',
      status: subscriptionResponse.status,
      current_period_end: new Date((subscriptionResponse as unknown).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscriptionResponse as unknown).cancel_at_period_end
    }, { onConflict: 'subscription_id' });

  if (error) {
  }

  const { error: profileUpdateError } = await supabase
    .from('Profile')
    .update({
      is_premium: true,
      premium_features: {
        unlimited_tweets: true,
        priority_visibility: true,
        exclusive_stories: true,
        no_ads: true
      }
    })
    .eq('id', profileId);

  if (profileUpdateError) {
  }
}

async function updateSubscriptionStatus(subscription: Stripe.Subscription) {
  // Récupérer l'abonnement dans Supabase
  const { data: subscriptionData } = await supabase
    .from('Subscriptions')
    .select('profile_id')
    .eq('subscription_id', subscription.id)
    .single();

  if (!subscriptionData) return;

  // Définir un type plus précis pour l'objet subscription avec les propriétés manquantes
  const subscriptionWithExtras = subscription as Stripe.Subscription & { 
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  // Mettre à jour le statut de l'abonnement
  await supabase
    .from('Subscriptions')
    .update({
      status: subscription.status,
      // Utiliser l'objet avec le type étendu
      current_period_end: new Date(subscriptionWithExtras.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscriptionWithExtras.cancel_at_period_end
    })
    .eq('subscription_id', subscription.id);

  // Si l'abonnement n'est plus actif, mettre à jour le statut premium
  if (subscription.status !== 'active') {
    await supabase
      .from('Profile')
      .update({ is_premium: false })
      .eq('id', subscriptionData.profile_id);
  }
}

async function cancelSubscription(subscription: Stripe.Subscription) {
  // Récupérer l'abonnement dans Supabase
  const { data: subscriptionData } = await supabase
    .from('Subscriptions')
    .select('profile_id')
    .eq('subscription_id', subscription.id)
    .single();

  if (!subscriptionData) return;

  // Mettre à jour le statut de l'abonnement
  await supabase
    .from('Subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false
    })
    .eq('subscription_id', subscription.id);

  // Retirer le statut premium
  await supabase
    .from('Profile')
    .update({
      is_premium: false,
      premium_features: null
    })
    .eq('id', subscriptionData.profile_id);
}