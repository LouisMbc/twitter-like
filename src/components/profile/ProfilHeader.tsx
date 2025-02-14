import React from 'react';

interface ProfilHeaderProps {
    username: string;
    bio: string;
    profileImageUrl: string;
}

const ProfilHeader: React.FC<ProfilHeaderProps> = ({ username, bio, profileImageUrl }) => {
    return (
        <div className="profil-header">
            <img src={profileImageUrl} alt={`${username}'s profile`} className="profile-image" />
            <h1 className="username">{username}</h1>
            <p className="bio">{bio}</p>
        </div>
    );
};

export default ProfilHeader;