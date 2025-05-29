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

  // Fonction pour l'auth Google
  const handleGoogleSignUp = async () => {
    // Utilise Supabase pour l'auth Google
    const { data, error } = await (await import("@/lib/supabase")).default.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined,
      },
    });
    if (error) {
      alert("Erreur lors de la connexion Google");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#282325] text-white">
      <div className="w-full py-10">
        <h1 className="text-4xl md:text-5xl font-bold text-center">
          L'essentiel de l'information est ici
        </h1>
      </div>
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-0 md:gap-0">
        <div className="flex flex-1 flex-col items-center justify-center mb-8 md:mb-0">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={300}
            height={300}
            priority
            className="object-contain"
          />
        </div>
        {/* Formulaire d'inscription à droite */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="bg-[#231f20] rounded-xl shadow-lg px-8 py-10 w-full max-w-[370px] flex flex-col items-center">
            <div className="w-full space-y-3">
              <p className="text-center text-lg font-semibold mb-2">Inscrivez vous</p>
              <button
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium rounded-full py-2.5 hover:bg-gray-100 transition"
                onClick={handleGoogleSignUp}
              >
                <Image src="/google.png" alt="Google" width={22} height={22} />
                Inscrivez-vous avec Google
              </button>
              <button
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium rounded-full py-2.5 hover:bg-gray-100 transition"
                onClick={() => {/* TODO: Auth Apple */}}
              >
                <Image src="/apple.png" alt="Apple" width={22} height={22} />
                Inscrivez-vous avec Apple
              </button>
              <div className="flex items-center my-2">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="mx-3 text-gray-400 font-bold">OU</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-full py-2.5 transition"
                onClick={() => router.push("/auth/register")}
              >
                Créer un compte
              </button>
            </div>
            <div className="mt-8 w-full text-center">
              <p className="text-gray-400 mb-2">Vous avez déjà un compte ?</p>
              <button
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-full py-2.5 transition"
                onClick={() => router.push("/auth/login")}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Séparateur au-dessus du footer */}
      <div className="w-full h-px bg-gray-700 mt-8" />
      {/* Footer */}
      <Footer />
    </div>
  );
}
