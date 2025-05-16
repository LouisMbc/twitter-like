// src/app/api/stripe/verify-session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID manquant' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Vérifier que la session est bien pour un paiement réussi
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Le paiement n\'a pas été complété' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Erreur lors de la vérification de la session:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la vérification de la session' },
      { status: 500 }
    );
  }
}