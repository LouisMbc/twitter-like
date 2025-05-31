"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/shared/Footer";
import supabase from "@/lib/supabase";

// Fonction pour créer le profil utilisateur
const createUserProfile = async (user: any) => {
  try {
    // Vérifier si le profil existe déjà
    const { data: existingProfile } = await supabase
      .from('Profile')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingProfile) {
      // Créer un nouveau profil
      const { error } = await supabase
        .from('Profile')
        .insert({
          user_id: user.id,
          firstName: user.user_metadata?.given_name || '',
          lastName: user.user_metadata?.family_name || '',
          nickname: user.user_metadata?.name || user.email?.split('@')[0],
          bio: null,
          profilePicture: user.user_metadata?.avatar_url || null,
          certified: false,
          is_premium: false,
          premium_features: {},
          follower_count: 0,
          following_count: 0
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    }
  } catch (error) {
    console.error('Error in createUserProfile:', error);
  }
};

export default function AuthPage() {
  const router = useRouter();

  // Écouter les changements d'authentification pour Google
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await createUserProfile(session.user);
        router.push('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Fonction pour l'auth Google - maintenant activée
  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Erreur Google OAuth:", error);
        alert("Erreur lors de la connexion Google: " + error.message);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      alert("Erreur lors de la connexion Google");
    }
  };

  // Fonction pour l'auth Apple - maintenant activée
  const handleAppleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("Erreur Apple OAuth:", error);
        alert("Erreur lors de la connexion Apple: " + error.message);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion Apple:", error);
      alert("Erreur lors de la connexion Apple");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black to-gray-900/20"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="w-full py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            L'essentiel de l'information est ici
          </h1>
          <p className="text-center text-gray-400 mt-4 text-lg">
            Découvrez, partagez et connectez-vous avec le monde
          </p>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-8">
          <div className="flex flex-1 flex-col items-center justify-center mb-8 md:mb-0 max-w-md">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
              <Image
                src="/logo_Flow.png"
                alt="Flow Logo"
                width={280}
                height={280}
                priority
                className="object-contain relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-8 text-center space-y-3">
              <h2 className="text-2xl font-semibold text-white">Bienvenue sur Flow</h2>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                La plateforme qui vous connecte aux conversations qui comptent vraiment.
              </p>
            </div>
          </div>
          
          {/* Formulaire d'inscription à droite */}
          <div className="flex flex-1 flex-col items-center justify-center max-w-md w-full">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl px-8 py-10 w-full border border-gray-700/50 relative overflow-hidden">
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 rounded-2xl"></div>
              
              <div className="relative z-10">
                <div className="w-full space-y-4">
                  <p className="text-center text-2xl font-semibold mb-6 text-white">Inscrivez-vous</p>
                  <button
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium rounded-full py-3 hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={handleGoogleSignUp}
                  >
                    <Image src="/google.png" alt="Google" width={22} height={22} />
                    Inscrivez-vous avec Google
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium rounded-full py-3 hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={handleAppleSignUp}
                  >
                    <Image src="/apple.png" alt="Apple" width={22} height={22} />
                    Inscrivez-vous avec Apple
                  </button>
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                    <span className="mx-4 text-gray-400 font-bold text-sm">OU</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
                  </div>
                  <button
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-full py-3 transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={() => router.push("/auth/register")}
                  >
                    Créer un compte
                  </button>
                </div>
                <div className="mt-8 w-full text-center">
                  <p className="text-gray-400 mb-4">Vous avez déjà un compte ?</p>
                  <button
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-full py-3 transition-all duration-200 hover:scale-105 shadow-lg"
                    onClick={() => router.push("/auth/login")}
                  >
                    Se connecter
                  </button>
                </div>
                
                {/* Additional styling */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    En vous inscrivant, vous acceptez nos{' '}
                    <a href="/terms" className="text-red-400 hover:text-red-300 underline">
                      conditions d'utilisation
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Séparateur au-dessus du footer */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-16" />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
