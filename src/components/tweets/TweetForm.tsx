import React, { useState } from 'react';

interface TweetFormProps {
    onTweetSubmit: (tweet: string) => void;
}

const TweetForm: React.FC<TweetFormProps> = ({ onTweetSubmit }) => {
    const [tweet, setTweet] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tweet.trim()) {
            onTweetSubmit(tweet);
            setTweet('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="tweet-form">
            <textarea
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                placeholder="What's happening?"
                maxLength={280}
                className="tweet-textarea"
            />
            <button type="submit" className="tweet-submit-button">
                Tweet
            </button>
        </form>
    );
};

export default TweetForm;