import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Ajouter une vérification pour s'assurer que la clé API est définie
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('La variable d\'environnement STRIPE_SECRET_KEY est manquante');
}

if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
  console.error('La variable d\'environnement STRIPE_PREMIUM_PRICE_ID est manquante');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId } = body;

    console.log('Requête reçue pour créer une session checkout', { profileId });

    if (!profileId) {
      console.error('ID de profil manquant dans la requête');
      return NextResponse.json({ error: 'ID de profil manquant' }, { status: 400 });
    }

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      console.error('STRIPE_PREMIUM_PRICE_ID n\'est pas défini');
      return NextResponse.json({ error: 'Configuration Stripe incomplète' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Logs pour déboguer
    console.log('Création d\'une session avec les paramètres suivants:', {
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      successUrl: `${baseUrl}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/premium?canceled=true`,
    });

    // Créer une session de checkout Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/premium?canceled=true`,
      metadata: {
        profileId,
      },
    });

    console.log('Session créée avec succès:', { sessionId: session.id });
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erreur détaillée lors de la création de la session:', error);
    // Retourner plus de détails sur l'erreur pour faciliter le débogage
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création de la session de checkout',
        details: error.message || 'Aucun détail disponible'
      },
      { status: 500 }
    );
  }
}