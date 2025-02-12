"use client";

import TweetComposer from '@/components/tweets/TweetComposer';
import { useRouter } from 'next/navigation';

export default function CreateTweetPage() {
  const router = useRouter();

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Créer un tweet</h1>
      <TweetComposer onSuccess={onTweetCreated} />
    </div>
  );
}