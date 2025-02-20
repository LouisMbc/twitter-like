import React from 'react';

interface Story {
    id: number;
    username: string;
    avatar: string;
    content: string;
}

interface StoryListProps {
    stories: Story[];
}

const StoryList: React.FC<StoryListProps> = ({ stories }) => {
    return (
        <div className="story-list">
            {stories.map(story => (
                <div key={story.id} className="story">
                    <img src={story.avatar} alt={`${story.username}'s avatar`} className="avatar" />
                    <div className="story-content">
                        <h4>{story.username}</h4>
                        <p>{story.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StoryList;