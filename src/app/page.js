"use client";
import React, { useState, useEffect } from "react";
import { getTweets } from "@/app/api/tweets";
import { translateText } from "@/app/api/translate";
import Header from "@/components/Header";

const Home = () => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    const fetchTweets = async () => {
      const tweets = await getTweets();
      setTweets(tweets);
    };
    fetchTweets();
  }, []);

  return (
    <div>
      <Header />
      <ul>
        {tweets.map(tweet => (
          <li key={tweet.id}>{tweet.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
