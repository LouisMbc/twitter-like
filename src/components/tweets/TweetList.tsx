import { Tweet } from '@/types';
import TweetCard from './TweetCard';

interface TweetListProps {
  tweets: Tweet[];
}

export default function TweetList({ tweets }: TweetListProps) {
  if (!tweets || tweets.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/20 to-gray-400/20 rounded-full blur-xl opacity-50"></div>
          <svg
            className="relative w-20 h-20 mx-auto text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.293 8.293a1 1 0 01-.607-.094L7 18l-2.293.293A1 1 0 014 17V9a8 8 0 018-8c4.418 0 8 3.582 8 8z"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text mb-3">
          Aucun tweet à afficher
        </h3>
        <p className="text-gray-400 text-lg">
          Commencez à suivre des personnes pour voir leurs tweets ici !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700/15 to-gray-600/15 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/30 hover:border-gray-700/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
            <TweetCard tweet={tweet} />
          </div>
        </div>
      ))}
    </div>
  );
}