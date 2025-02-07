--tweet
CREATE TABLE public.tweets (
    id SERIAL PRIMARY KEY,
    content TEXT, -- Peut être NULL pour les retweets simples
    author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    picture TEXT[],
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    retweet_id INTEGER REFERENCES tweets(id),
    view_count INTEGER DEFAULT 0,
    CONSTRAINT valid_tweet CHECK (
        -- Soit c'est un tweet original (retweet_id NULL et content NOT NULL)
        -- Soit c'est un retweet (retweet_id NOT NULL)
        (retweet_id IS NULL AND content IS NOT NULL) OR 
        (retweet_id IS NOT NULL)
    )
);

-- Index pour améliorer les performances des requêtes sur les retweets
CREATE INDEX idx_tweets_retweet_id ON public.tweets(retweet_id);
CREATE INDEX idx_tweets_author_id ON public.tweets(author_id);




--administrateurs
-- Création d'un type enum pour les différents niveaux d'administration
CREATE TYPE auth.admin_role AS ENUM ('super_admin', 'moderator', 'content_manager');

-- Création de la table administrateurs
CREATE TABLE auth.administrators (
    id SERIAL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role auth.admin_role NOT NULL DEFAULT 'moderator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by uuid REFERENCES auth.users(id), -- L'admin qui a créé cet admin
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- Index pour améliorer les performances
CREATE INDEX idx_administrators_user_id ON auth.administrators(user_id);
CREATE INDEX idx_administrators_role ON auth.administrators(role);

-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id uuid)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM auth.administrators 
        WHERE user_id = $1 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE auth.administrators ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture
CREATE POLICY "Les admins peuvent voir les autres admins" ON auth.administrators
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM auth.administrators 
            WHERE is_active = true
        )
    );

-- Politique pour la création de nouveaux admins (super_admin uniquement)
CREATE POLICY "Seuls les super_admins peuvent créer des admins" ON auth.administrators
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM auth.administrators 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        )
    );

-- Politique pour la modification
CREATE POLICY "Les super_admins peuvent modifier tous les admins" ON auth.administrators
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM auth.administrators 
            WHERE user_id = auth.uid() 
            AND role = 'super_admin' 
            AND is_active = true
        )
    );



-- Table Following (relation suiveur/suivi)
CREATE TABLE following (
    id SERIAL PRIMARY KEY,
    following_id INTEGER NOT NULL REFERENCES users(id),
    follower_id INTEGER NOT NULL REFERENCES users(id),
    UNIQUE(following_id, follower_id)
);





-- Table Comments
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    tweet_id INTEGER NOT NULL REFERENCES tweets(id),
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL REFERENCES users(id),
    parent_comment_id INTEGER REFERENCES comments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




-- Table Hashtags
CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    content TEXT UNIQUE NOT NULL
);

-- Table de liaison Tweet-Hashtag
CREATE TABLE tweet_hashtags (
    id SERIAL PRIMARY KEY,
    tweet_id INTEGER NOT NULL REFERENCES tweets(id),
    hashtag_id INTEGER NOT NULL REFERENCES hashtags(id),
    UNIQUE(tweet_id, hashtag_id)
);




-- Table Story (pour les stories éphémères)
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    content TEXT,
    media_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '24 hours',
    user_id INTEGER NOT NULL
);


-- Ajout des contraintes de clés étrangères pour stories
ALTER TABLE stories
ADD CONSTRAINT fk_stories_user
FOREIGN KEY (user_id) REFERENCES users(id);



--table reaction
CREATE TABLE reactions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tweet_id UUID REFERENCES tweets(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL,  -- Stocke l'emoji (ex: '❤️', '😂', '😡')
    created_at TIMESTAMP DEFAULT now()
);



--table profile
CREATE TABLE public.profiles (
    id bigint primary key generated always as identity,
    created_at timestamp with time zone DEFAULT now(),
    bio text,
    certified boolean,
    profilePicture text,
    lastName text,
    firstName text,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
) WITH (OIDS=FALSE);




--table Hashtag_subscriptions
CREATE TABLE public.Hashtag_subscriptions (
    id bigint primary key generated always as identity,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hashtag_id bigint NOT NULL REFERENCES public."Hashtags"(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.Hashtag_subscriptions ENABLE ROW LEVEL SECURITY;




--table Blocked_hashtags
CREATE TABLE public.Blocked_hashtags (
    id bigint primary key generated always as identity,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hashtag_id bigint NOT NULL REFERENCES public."Hashtags"(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.Blocked_hashtags ENABLE ROW LEVEL SECURITY;





