import React from 'react';
import { Card, CardContent, Typography, Avatar, Button } from '@material-ui/core';

interface ProfileCardProps {
    name: string;
    username: string;
    bio: string;
    avatarUrl: string;
    following: number;
    followers: number;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, username, bio, avatarUrl, following, followers }) => {
    return (
        <Card style={{ maxWidth: 345, margin: 'auto' }}>
            <CardContent>
                <Avatar alt={name} src={avatarUrl} style={{ width: 60, height: 60, margin: 'auto' }} />
                <Typography variant="h6" component="h2" align="center">
                    {name}
                </Typography>
                <Typography color="textSecondary" align="center">
                    @{username}
                </Typography>
                <Typography variant="body2" component="p" align="center">
                    {bio}
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 10 }}>
                    <Typography variant="body2" component="p">
                        <strong>{following}</strong> Following
                    </Typography>
                    <Typography variant="body2" component="p">
                        <strong>{followers}</strong> Followers
                    </Typography>
                </div>
                <Button variant="contained" color="primary" fullWidth style={{ marginTop: 10 }}>
                    Follow
                </Button>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;