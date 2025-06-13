import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Vérification des variables d'environnement
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('La variable d\'environnement STRIPE_SECRET_KEY est manquante');
}

if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
  throw new Error('La variable d\'environnement STRIPE_PREMIUM_PRICE_ID est manquante');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profileId } = body;

    if (!profileId) {
      return NextResponse.json({ error: 'ID de profil manquant' }, { status: 400 });
    }

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      return NextResponse.json({ error: 'Configuration Stripe incomplète' }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

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

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de checkout' },
      { status: 500 }
    );
  }
}