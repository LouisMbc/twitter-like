import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { content, media_url } = await req.json();
    
    // Initialiser le client Supabase avec les cookies pour l'authentification
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Récupérer l'ID utilisateur depuis la session
    const user_id = session.user.id;
    
    // Insérer le tweet avec l'ID de l'utilisateur authentifié
    const { data, error } = await supabase
      .from('Tweets')
      .insert([
        {
          content,
          media_url,
          user_id,
        }
      ])
      .select();
    
    if (error) {
      console.error('Erreur lors de la création du tweet:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
