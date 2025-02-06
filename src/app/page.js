"use client";
import { useState, useEffect } from "react";
import { getTweets } from "@/app/api/tweets";

export default function Home() {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    async function fetchTweets() {
      const data = await getTweets();
      setTweets(data || []);
    }
    fetchTweets();
  }, []);

  return (
    <main className="p-6 bg-secondary dark:bg-gray-800 min-h-screen">
      <h1 className="text-primary text-4xl font-bangers">Kosupure</h1>
      {tweets.map((tweet) => (
        <div key={tweet.id} className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-md mt-4">
          <p className="text-gray-700 dark:text-gray-300">{tweet.content}</p>
        </div>
      ))}
    </main>
  );
}