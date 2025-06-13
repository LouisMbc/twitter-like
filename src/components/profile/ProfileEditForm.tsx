"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Profile } from '@/types';

interface ProfileEditFormProps {
  profile: Profile;
  onSave: (updatedProfile: Profile) => void;
}

export default function ProfileEditForm({ profile, onSave }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    nickname: profile.nickname || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || ''
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);

  useEffect(() => {
    if (profile.profilePicture) {
      setPreviewImage(profile.profilePicture);
    }
    if (profile.bannerPicture) {
      setPreviewBanner(profile.bannerPicture);
    }
  }, [profile.profilePicture, profile.bannerPicture]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewBanner(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile: Profile = {
      ...profile,
      nickname: formData.nickname,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      profilePicture: previewImage || profile.profilePicture,
      bannerPicture: previewBanner || profile.bannerPicture
    };
    
    onSave(updatedProfile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          {previewImage || profile.profilePicture ? (
            <Image
              src={previewImage || profile.profilePicture || ''}
              alt="Profile"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-30 h-30 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-600">
                {formData.nickname.charAt(0) || '?'}
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
      
      {/* Banner preview */}
      {/* Banner preview */}
      {previewBanner || profile.bannerPicture ? (
        <div className="w-full h-48 relative rounded-lg overflow-hidden">
          <Image
            src={previewBanner || profile.bannerPicture || ''}
            alt="Banner"
            fill
            className="object-cover"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center relative">
          <span className="text-gray-400">Click to add banner</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      )}
      <div className="space-y-4">
        {/* Pseudo */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Pseudo</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Votre pseudo"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Bio</label>
          <textarea
            name="bio"
            rows={3}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
            placeholder="Parlez-nous de vous..."
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="Votre location"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-300">Website</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
            placeholder="https://votre-site.com"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => {/* Handle cancel */}}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
