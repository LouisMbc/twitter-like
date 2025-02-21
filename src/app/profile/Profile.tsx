"use client";

import React, { useState } from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import ProfileEdit from '@/components/profile/ProfileEdit';
import ProfileCard from '@/components/profile/ProfileCard';
import EditProfilePage from './Edit';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'tweets' | 'comments'>('tweets');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    bio: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleTabChange = (tab: 'tweets' | 'comments') => {
    setActiveTab(tab);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
    }, 2000);
  };

  // const handleEditToggle = () => {
  //   setIsEditing(!isEditing);
  // };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const profile = {
    id: '1',
    user_id: '1',
    firstName: 'John',
    lastName: 'Doe',
    nickname: 'johndoe',
    bio: 'This is a bio',
    profilePicture: '',
    created_at: '2023-01-01T00:00:00Z',
    follower_count: 100,
    following_count: 50,
  };

  return (
    <div>
      <ProfileHeader
        profile={profile}
        followersCount={100}
        followingCount={50}
        currentProfileId="1"
        isFollowing={false}
        onFollowToggle={() => {}}
      />
      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
      {isEditing ? (
        <EditProfilePage/>
      ) : (
        <ProfileCard
          profile={profile}
          followersCount={100}
          followingCount={50}
        />
      )}
      <ProfileSetupForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleFormSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
};

export default Profile;
