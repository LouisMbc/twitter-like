import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { Tweet } from '@/types';

export default function useFeed() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = async () => {
    console.log('--- DÉBUT CHARGEMENT DU FEED ---');
    try {
      setLoading(true);
      
      // 1. Obtenir l'identifiant de l'utilisateur connecté
      console.log('1. Récupération de la session utilisateur...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erreur de session:', sessionError);
        throw sessionError;
      }
      
      if (!session) {
        console.error('Pas de session trouvée');
        throw new Error("Utilisateur non authentifié");
      }
      console.log('Session utilisateur trouvée, ID:', session.user.id);
      
      // 2. Récupérer le profil de l'utilisateur
      console.log('2. Récupération du profil utilisateur...');
      const { data: profileData, error: profileError } = await supabase
        .from('Profile')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!profileData) throw new Error('Profil non trouvé');
      
      if (profileError) {
        console.error('Erreur de profil:', profileError);
        throw profileError;
      }
      console.log('Profil trouvé, ID:', profileData.id);

      // 3. Récupérer la liste des utilisateurs suivis
      console.log('3. Récupération des utilisateurs suivis...');
      const { data: followingData, error: followingError } = await supabase
        .from('Following')
        .select('following_id')
        .eq('follower_id', profileData.id);
      
      if (followingError) {
        console.error('Erreur lors de la récupération des following:', followingError);
        throw followingError;
      }
      
      // 4. Préparer un tableau avec les IDs des utilisateurs suivis + l'utilisateur lui-même
      const followingIds = followingData?.map(item => item.following_id) || [];
      const userIds = [...followingIds, profileData.id];
      console.log('Nombre d\'utilisateurs suivis:', followingIds.length);
      console.log('Liste des utilisateurs (suivis + soi-même):', userIds);
      
      // 5. Si l'utilisateur ne suit personne, afficher un message approprié
      if (followingIds.length === 0) {
        console.log("Vous ne suivez aucun utilisateur. Seuls vos tweets seront affichés.");
      }
      
      // 6. Récupérer tous les tweets des utilisateurs suivis + les siens
      console.log('6. Récupération des tweets...');
      if (userIds.length === 0) {
        console.error('Aucun ID d\'utilisateur pour récupérer les tweets');
        setTweets([]);
        return;
      }
      
      const query = supabase
      .from('Tweets')
      .select(`
        id,
        content,
        picture,
        published_at,
        view_count,
        retweet_id,
        author_id,
        author:author_id (
          id,
          nickname,
          profilePicture
        )
      `)
      .in('author_id', userIds)
      .order('published_at', { ascending: false });

        console.log('Requête préparée:', query);

      const { data: allTweets, error: tweetsError } = await query;
      
      if (tweetsError) {
        console.error('Erreur lors de la récupération des tweets:', tweetsError);
        throw tweetsError;
      }
      
      console.log('Tweets récupérés:', allTweets?.length || 0);
      
      // 7. S'assurer que les données sont valides
      if (!allTweets) {
        console.error('allTweets est undefined ou null');
        setTweets([]);
        return;
      }
      
      if (!Array.isArray(allTweets)) {
        console.error('allTweets n\'est pas un tableau:', typeof allTweets);
        setTweets([]);
        return;
      }
      
      if (allTweets.length === 0) {
        console.log("Aucun tweet trouvé dans votre fil d'actualité");
        setTweets([]);
        return;
      }
      
      // Debugger le premier tweet pour voir sa structure
      console.log('Structure du premier tweet:', JSON.stringify(allTweets[0], null, 2));

      // Transformer les données pour correspondre à votre interface Tweet
      console.log('7. Transformation des données...');
      try {
        const formattedTweets = allTweets.map((tweet, index) => {
          console.log(`Traitement du tweet ${index + 1}/${allTweets.length}, ID: ${tweet.id}`);
          
          // Vérifier si author est un tableau et prendre le premier élément si c'est le cas
          let author;
          try {
            author = Array.isArray(tweet.author) 
              ? tweet.author[0] 
              : tweet.author;
            
            if (!author) {
              console.warn(`Tweet ${tweet.id}: Auteur manquant, utilisation d'une valeur par défaut`);
              author = { id: 'inconnu', nickname: 'Utilisateur inconnu', profilePicture: null };
            }
          } catch (authorError) {
            console.error(`Erreur lors du traitement de l'auteur pour le tweet ${tweet.id}:`, authorError);
            author = { id: 'inconnu', nickname: 'Utilisateur inconnu', profilePicture: null };
          }
          
          return {
            id: tweet.id,
            content: tweet.content || '',
            picture: tweet.picture || null,
            published_at: tweet.published_at || new Date().toISOString(),
            view_count: tweet.view_count || 0,
            retweet_id: tweet.retweet_id || null,
            author: author,
            author_id: tweet.author_id
          };
        });
        
        console.log('Tweets formatés avec succès:', formattedTweets.length);
        setTweets(formattedTweets);
      } catch (formatError) {
        console.error('Erreur lors du formatage des tweets:', formatError);
        throw formatError;
      }
      
      console.log('--- CHARGEMENT DU FEED TERMINÉ AVEC SUCCÈS ---');
    } catch (err) {
      console.error('Erreur lors du chargement du feed:', err);
      console.error('Type d\'erreur:', typeof err);
      console.error('Message d\'erreur:', err instanceof Error ? err.message : 'Erreur inconnue');
      console.error('Stack trace:', err instanceof Error ? err.stack : 'Pas de stack trace disponible');
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du feed');
      setTweets([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger le feed au montage du composant
  useEffect(() => {
    fetchFeed();
  }, []);
  
  // Fonction pour rafraîchir le feed
  const refreshFeed = () => {
    fetchFeed();
  };
  
  return { tweets, loading, error, refreshFeed };
}