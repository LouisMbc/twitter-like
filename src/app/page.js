"use client";
import React, { useState, useEffect } from "react";
import { getTweets } from "./api/tweets";
import Header from "../components/Header";

const Home = () => {
  const [tweets, setTweets] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const tweets = await getTweets();
        setTweets(tweets);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTweets();
  }, []);

  return (
    <div>
      <Header />
      {error && <p>Error: {error}</p>}
      <ul>
        {tweets.map(tweet => (
          <li key={tweet.id}>{tweet.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
