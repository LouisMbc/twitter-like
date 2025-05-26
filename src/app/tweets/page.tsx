"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaTimes, FaImage, FaPoll, FaSmile } from 'react-icons/fa';
import { FC, useState, useRef, ChangeEvent } from 'react';
import React from 'react';
import Header from '@/components/shared/Header';

interface TweetComposerProps {
  onSuccess?: () => void;
}
const TweetComposer: FC<TweetComposerProps> = ({ onSuccess }) => {
  const [tweetContent, setTweetContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      // Show error (would be better to have actual error handling)
      alert('Maximum 4 images allowed');
      return;
    }
    setImages(files);
    const imgPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(imgPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...previews];
    
    newImages.splice(index, 1);
    URL.revokeObjectURL(previews[index]);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const handleSubmit = async () => {
    if (!tweetContent.trim() && images.length === 0) return;
    
    setIsLoading(true);
    try {
      // Implement your tweet creation logic here
      // Example: await createTweet(tweetContent, images);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create tweet:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="p-4">
        <textarea
          className="bg-black text-white border-0 w-full p-3 text-lg resize-none h-36 focus:outline-none placeholder-gray-500"
          placeholder="Que voulez-vous partager?"
          value={tweetContent}
          onChange={(e) => setTweetContent(e.target.value)}
        />
        
        {/* Image previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden aspect-square">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                >
                  <FaTimes size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-800 p-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button 
            onClick={handleImageSelect}
            className="p-2 text-red-500 rounded-full hover:bg-gray-800 transition-colors"
          >
            <FaImage size={20} />
          </button>
          <button className="p-2 text-red-500 rounded-full hover:bg-gray-800 transition-colors">
            <FaPoll size={20} />
          </button>
          <button className="p-2 text-red-500 rounded-full hover:bg-gray-800 transition-colors">
            <FaSmile size={20} />
          </button>
          {tweetContent && (
            <span className={`self-center text-sm ${tweetContent.length > 260 ? 'text-yellow-500' : 'text-gray-400'}`}>
              {tweetContent.length}/280
            </span>
          )}
        </div>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full disabled:bg-gray-700 disabled:text-gray-400 transition-colors"
          onClick={handleSubmit}
          disabled={isLoading || (!tweetContent.trim() && images.length === 0)}
        >
          {isLoading ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </div>
  );
};

export default function CreateTweetPage() {
  const router = useRouter();
  useAuth(); // Protection de la route

  const onTweetCreated = () => {
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Header />
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-gray-800 mr-4"
            >
              <FaArrowLeft className="text-red-500" />
            </button>
            <h1 className="text-xl font-bold">Créer un tweet</h1>
          </div>
          <TweetComposer onSuccess={onTweetCreated} />
        </div>
      </div>
    </div>
  );
}