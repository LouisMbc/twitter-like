import React from 'react';

const ProfilEdit: React.FC = () => {
    const handleEditClick = () => {
        // Logic for editing the profile goes here
        console.log('Edit button clicked');
    };

    return (
        <div>
            <button onClick={handleEditClick}>Edit Profile</button>
        </div>
    );
};

export default ProfilEdit;