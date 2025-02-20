import { Tweet } from '@/types';
import TweetCard from './TweetCard';

interface TweetListProps {
  tweets: Tweet[];
}

export default function TweetList({ tweets }: TweetListProps) {
  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Aucun tweet à afficher
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}