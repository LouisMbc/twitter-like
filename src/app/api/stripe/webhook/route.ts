// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buffer } from 'micro';
import supabase from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
    
  console.log("Webhook reçu");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log("Événement validé:", event.type);
  } catch (error) {
    console.error("Erreur webhook:", error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook error' }),
      { status: 400 }
    );
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Session checkout complétée:", session.id);
      await handleCheckoutSessionCompleted(session);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentSucceeded(invoice);
      break;
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(deletedSubscription);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const profileId = session.metadata?.profileId;
  
  if (!profileId) return;

  if (!session.subscription) return;

  const subscriptionId = typeof session.subscription === 'string' 
    ? session.subscription
    : session.subscription.id;

  const subscriptionResponse = await stripe.subscriptions.retrieve(subscriptionId);
  const { data, error } = await supabase
    .from('Subscriptions')
    .upsert({
      profile_id: profileId,
      subscription_id: subscriptionId,
      plan: 'premium',
      status: subscriptionResponse.status,
      current_period_end: new Date((subscriptionResponse as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: (subscriptionResponse as any).cancel_at_period_end
    }, { onConflict: 'subscription_id' });

  if (error) {
    console.error('Erreur Supabase upsert Subscriptions:', error);
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
    console.error('Erreur Supabase update Profile:', profileUpdateError);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Utiliser une assertion de type pour accéder aux propriétés qui peuvent ne pas être définies
  // dans les types TypeScript mais qui existent dans l'objet réel à l'exécution
  const invoiceWithSubscription = invoice as Stripe.Invoice & { 
    subscription?: string | { id: string } 
  };
  
  // Vérifier si l'abonnement est disponible
  if (!invoiceWithSubscription.subscription) {
    console.log('Aucun abonnement trouvé pour cette facture:', invoice);
    return;
  }
  
  // Extraire l'ID de l'abonnement selon son type
  const subscriptionId = typeof invoiceWithSubscription.subscription === 'string'
    ? invoiceWithSubscription.subscription
    : invoiceWithSubscription.subscription.id;

  // Récupérer les détails de l'abonnement
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Le reste du code reste inchangé...
  const { data: subscriptionData } = await supabase
    .from('Subscriptions')
    .select('profile_id')
    .eq('subscription_id', subscriptionId)
    .single();

  if (!subscriptionData) return;

  await supabase
    .from('Subscriptions')
    .update({
      status: subscription.status,
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
    })
    .eq('subscription_id', subscriptionId);

  await supabase
    .from('Profile')
    .update({ is_premium: true })
    .eq('id', subscriptionData.profile_id);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
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

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
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