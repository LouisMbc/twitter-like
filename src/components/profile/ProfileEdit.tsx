"use client";

import React from 'react';

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Modifier le profil</h1>
            {error && <div className="text-red-500">{error}</div>}
            <form onSubmit={handleEditClick}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                    />
                </div>
                {/* Ajoutez d'autres champs de formulaire selon les besoins */}
                <button type="submit" disabled={loading} className="mr-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                    Modifier le profil
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded-md">
                    Annuler
                </button>
            </form>
        </div>
    );
};

export default ProfileEdit;