import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Vérifier si l'utilisateur est connecté
  const { data: { session } } = await supabase.auth.getSession();
  
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/auth/login', '/auth/register', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  
  // Route de configuration de profil
  const isProfileSetupRoute = req.nextUrl.pathname === '/profile/setup';
  
  if (!session) {
    // Si non connecté et pas sur une route publique, rediriger vers login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return res;
  }
  
  // Utilisateur connecté
  if (session) {
    // Vérifier si l'utilisateur a un profil
    const { data: profile, error } = await supabase
      .from('Profile')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    
    // Si pas de profil et pas sur la page setup, rediriger vers setup
    if (!profile && !isProfileSetupRoute) {
      return NextResponse.redirect(new URL('/profile/setup', req.url));
    }
    
    // Si profil existe et sur la page setup, rediriger vers profile
    if (profile && isProfileSetupRoute) {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }
  
  return res;
}

// Ajouter les chemins sur lesquels le middleware doit s'exécuter
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};