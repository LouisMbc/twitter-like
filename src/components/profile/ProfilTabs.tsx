import React from 'react';
import { Tabs, Tab } from '@material-ui/core';

interface ProfileTabsProps {
    selectedTab: number;
    handleTabChange: (event: React.ChangeEvent<{}>, newValue: number) => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ selectedTab, handleTabChange }) => {
    return (
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Tweets" />
            <Tab label="Replies" />
            <Tab label="Media" />
            <Tab label="Likes" />
        </Tabs>
    );
};

export default ProfileTabs;