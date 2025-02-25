import React, { useState } from 'react';

interface FollowerButtonProps {
    initialFollowing: boolean;
}

const FollowerButton: React.FC<FollowerButtonProps> = ({ initialFollowing }) => {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);

    const handleFollowClick = () => {
        setIsFollowing(!isFollowing);
    };

    return (
        <button onClick={handleFollowClick} className="follower-button">
            {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
    );
};

export default FollowerButton;