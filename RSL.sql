-- Description: SQL script to create the RSL schema and policies

-- RLS Tweets
-- Seuls les utilisateurs connectés peuvent lire les tweets
CREATE POLICY "Allow authenticated users to read tweets"
ON public."Tweets"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Seul l'auteur peut modifier son tweet
CREATE POLICY "Allow tweet owners to update"
ON public."Tweets"
FOR UPDATE
USING (auth.uid() = author_id);

-- Seul l'auteur peut supprimer son tweet
CREATE POLICY "Allow tweet owners to delete"
ON public."Tweets"
FOR DELETE
USING (auth.uid() = author_id);

-- Un utilisateur peut créer un tweet seulement pour lui-même
CREATE POLICY "Allow users to insert their own tweets"
ON public."Tweets"
FOR INSERT
WITH CHECK (auth.uid() = author_id);








-- RLS Comments
-- Seuls les utilisateurs connectés peuvent lire les commentaires
CREATE POLICY "Allow authenticated users to read comments"
ON public."Comments"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Seul l'auteur peut modifier son propre commentaire
CREATE POLICY "Allow comment owners to update"
ON public."Comments"
FOR UPDATE
USING (auth.uid() = author_id);

-- Seul l'auteur peut supprimer son propre commentaire
CREATE POLICY "Allow comment owners to delete"
ON public."Comments"
FOR DELETE
USING (auth.uid() = author_id);

-- Un utilisateur peut insérer un commentaire sous un tweet existant ou un autre commentaire existant
CREATE POLICY "Allow users to insert comments under existing tweets or comments"
ON public."Comments"
FOR INSERT
WITH CHECK (
    auth.uid() = author_id AND 
    (EXISTS (SELECT 1 FROM public."Tweets" WHERE public."Tweets".id = public."Comments".tweet_id) OR
     EXISTS (SELECT 1 FROM public."Comments" AS ParentComments WHERE ParentComments.id = public."Comments".parent_comment_id))
);






-- RSL Stories
-- Seuls les followers peuvent voir les stories de l'utilisateur
CREATE POLICY "Allow followers to view stories"
ON public."Stories"
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public."Following" 
        WHERE public."Following".following_id = public."Stories".user_id 
        AND public."Following".follower_id = auth.uid()
    ) 
    OR public."Stories".user_id = auth.uid() -- L'utilisateur peut voir ses propres stories
);

-- Seul l'auteur de la story peut modifier sa propre story
CREATE POLICY "Allow story owners to update"
ON public."Stories"
FOR UPDATE
USING (auth.uid() = user_id);

-- Seul l'auteur de la story peut supprimer sa propre story
CREATE POLICY "Allow story owners to delete"
ON public."Stories"
FOR DELETE
USING (auth.uid() = user_id);

-- Un utilisateur peut poster une story uniquement pour lui-même
CREATE POLICY "Allow users to insert their own stories"
ON public."Stories"
FOR INSERT
WITH CHECK (auth.uid() = user_id);




-- RSL Reaction
-- Tout le monde peut voir les réactions
CREATE POLICY "Allow all users to view reactions"
ON public."Reaction"
FOR SELECT
USING (true);

-- Un utilisateur peut ajouter une réaction à un tweet
CREATE POLICY "Allow users to insert reactions"
ON public."Reaction"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Un utilisateur peut supprimer sa propre réaction
CREATE POLICY "Allow users to delete their own reactions"
ON public."Reaction"
FOR DELETE
USING (auth.uid() = user_id);






-- RSL Following
-- Un utilisateur peut suivre un autre utilisateur
CREATE POLICY "Allow users to follow others"
ON public."Following"
FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Un utilisateur peut se désabonner (supprimer son follow)
CREATE POLICY "Allow users to unfollow others"
ON public."Following"
FOR DELETE
USING (auth.uid() = follower_id);

-- Empêcher un utilisateur de modifier les abonnements des autres
CREATE POLICY "Prevent users from updating others' follow relationships"
ON public."Following"
FOR UPDATE
USING (false);

-- Seul un utilisateur peut voir ses propres abonnements et ceux des personnes qu’il suit
CREATE POLICY "Allow users to see their own follows and their subscriptions"
ON public."Following"
FOR SELECT
USING (
  auth.uid() = follower_id -- L'utilisateur peut voir ses propres abonnements
  OR auth.uid() IN (SELECT following_id FROM public."Following" WHERE follower_id = auth.uid()) -- L'utilisateur peut voir les abonnés des personnes qu'il suit
);





-- RSL Profile
-- Enable RLS
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create their own profile"
ON "Profile"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON "Profile"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON "Profile"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);





--RSL Hashtag_subscriptions
CREATE POLICY select_own_hashtags
    ON public.Hashtag_subscriptions
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY insert_own_hashtags
    ON public.Hashtag_subscriptions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY update_own_hashtags
    ON public.Hashtag_subscriptions
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY delete_own_hashtags
    ON public.Hashtag_subscriptions
    FOR DELETE
    USING (user_id = auth.uid());

-- Activer la RLS sur la table
ALTER TABLE public.Hashtag_subscriptions ENABLE ROW LEVEL SECURITY;






-- RSL Blocked_hashtags
-- Activer la RLS pour la table Blocked_hashtags
CREATE POLICY select_own_blocked_hashtags
    ON public.Blocked_hashtags
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY insert_own_blocked_hashtags
    ON public.Blocked_hashtags
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY update_own_blocked_hashtags
    ON public.Blocked_hashtags
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY delete_own_blocked_hashtags
    ON public.Blocked_hashtags
    FOR DELETE
    USING (user_id = auth.uid());

-- Activer la RLS sur la table
ALTER TABLE public.Blocked_hashtags ENABLE ROW LEVEL SECURITY;



--RSL pour le  bucket des photo de profile
-- Permettre l'upload des images de profil
CREATE POLICY "Allow authenticated users to upload profile pictures"
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profiles');

-- Permettre la lecture des images de profil
CREATE POLICY "Allow public to view profile pictures"
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'profiles');