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
    view_count INT DEFAULT 0
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
    viewed_at TIMESTAMP DEFAULT now()
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
