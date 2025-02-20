"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileEdit } from '@/hooks/useProfileEdit';

interface ProfileEditProps {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: () => void;
    error: string | null;
    loading: boolean;
    onCancel: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ formData, setFormData, onSubmit, error, loading, onCancel }) => {
    const handleEditClick = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Modifier le profil</h1>
            {error && <div className="text-red-500">{error}</div>}
            <form onSubmit={handleEditClick}>
                {/* Add form fields here and bind them to formData and setFormData */}
                <button type="submit" disabled={loading}>Edit Profile</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </form>
        </div>
    );
};

export default ProfileEdit;