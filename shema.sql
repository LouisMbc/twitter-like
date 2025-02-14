-- Table Profile
CREATE TABLE public."Profile" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    firstName TEXT,
    lastName TEXT,
    nickname TEXT UNIQUE,
    profilePicture TEXT,
    bio TEXT,
    certified BOOLEAN DEFAULT FALSE,
    follower_count INT DEFAULT 0,
    following_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- Table Tweets
CREATE TABLE public."Tweets" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    picture TEXT,
    published_at TIMESTAMP DEFAULT now(),
    retweet_id UUID REFERENCES public."Tweets"(id) ON DELETE SET NULL,
    view_counts INT DEFAULT 0
    );

-- Table Comments
CREATE TABLE public."Comments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    tweet_id UUID NOT NULL REFERENCES public."Tweets"(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public."Comments"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    view_count INT DEFAULT 0
);

-- Table ViewCount
CREATE TABLE public."ViewCount" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id UUID REFERENCES public."Tweets"(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public."Comments"(id) ON DELETE CASCADE,
    viewer_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    view_count INT DEFAULT 0
);

-- Table reactions
CREATE TABLE public."reactions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    tweet_id UUID REFERENCES public."Tweets"(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public."Comments"(id) ON DELETE CASCADE,
    reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'haha', 'sad', 'angry')),
    created_at TIMESTAMP DEFAULT now()
);

-- Table Following
CREATE TABLE public."Following" (
    id SERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    UNIQUE(follower_id, following_id)
);

-- Table Stories
CREATE TABLE public."Stories" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP
);

-- Table Hashtags
CREATE TABLE public."Hashtags" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT UNIQUE NOT NULL
);

-- Table Tweet_Hashtags
CREATE TABLE public."Tweet_Hashtags" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tweet_id UUID NOT NULL REFERENCES public."Tweets"(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public."Hashtags"(id) ON DELETE CASCADE
);

-- Table Hashtag Subscriptions
CREATE TABLE public."Hashtag_Subscriptions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public."Hashtags"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);

-- Table Blocked Hashtags
CREATE TABLE public."Blocked_Hashtags" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."Profile"(id) ON DELETE CASCADE,
    hashtag_id UUID NOT NULL REFERENCES public."Hashtags"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);



-- Incrémenter following_count pour le follower
  UPDATE "Profile" 
  SET following_count = following_count + 1
  WHERE id = follower;
  
  -- Incrémenter follower_count pour la cible
  UPDATE "Profile"
  SET follower_count = follower_count + 1
  WHERE id = target;

   -- Décrémenter following_count pour le follower
  UPDATE "Profile"
  SET following_count = GREATEST(following_count - 1, 0)
  WHERE id = follower;
  
  -- Décrémenter follower_count pour la cible
  UPDATE "Profile"
  SET follower_count = GREATEST(follower_count - 1, 0)
  WHERE id = target;

  -- Table pour suivre les vues uniques (temporaire, avant transfert vers Redis)
CREATE TABLE public."ViewTracking" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT CHECK (content_type IN ('tweet', 'comment')),
    viewer_id UUID REFERENCES public."Profile"(id),
    ip_address TEXT,
    user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT unique_view CHECK (viewer_id IS NOT NULL OR (ip_address IS NOT NULL AND user_agent IS NOT NULL))
);

-- Index pour optimiser les requêtes de vérification
CREATE INDEX idx_view_tracking_content ON public."ViewTracking" (content_id, content_type);
CREATE INDEX idx_view_tracking_viewer ON public."ViewTracking" (viewer_id) WHERE viewer_id IS NOT NULL;