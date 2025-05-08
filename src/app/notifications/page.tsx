import React, { useEffect, useState } from "react";

"use client";


interface Notification {
    id: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetching notifications
        // Replace with actual API call
        setTimeout(() => {
            const mockNotifications = [
                {
                    id: "1",
                    message: "Someone liked your post",
                    timestamp: new Date().toISOString(),
                    read: false,
                },
                {
                    id: "2",
                    message: "New follower",
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    read: false,
                },
            ];
            setNotifications(mockNotifications);
            setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>
            
            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length > 0 ? (
                <ul className="space-y-4">
                    {notifications.map((notification) => (
                        <li 
                            key={notification.id}
                            className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                        >
                            <p className="font-medium">{notification.message}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(notification.timestamp).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No notifications yet.</p>
            )}
        </div>
    );
}