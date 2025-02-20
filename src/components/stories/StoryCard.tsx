import React from 'react';

interface StoryCardProps {
    username: string;
    storyImage: string;
    profileImage: string;
}

const StoryCard: React.FC<StoryCardProps> = ({ username, storyImage, profileImage }) => {
    return (
        <div className="story-card">
            <div className="story-card__header">
                <img className="story-card__profile-image" src={profileImage} alt={`${username}'s profile`} />
                <span className="story-card__username">{username}</span>
            </div>
            <img className="story-card__image" src={storyImage} alt={`${username}'s story`} />
        </div>
    );
};

export default StoryCard;
