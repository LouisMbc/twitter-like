"use client";

import { useState, useEffect } from 'react';
import { mentionService } from '@/services/supabase/mention';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
}

export default function MentionTextarea({ 
  value, 
  onChange, 
  placeholder,
  className,
  rows = 4,
  maxLength 
}: MentionTextareaProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const handleContentChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(position);

    // Détecter si l'utilisateur tape une mention
    const textBeforeCursor = newValue.substring(0, position);
    const words = textBeforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];
    
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const query = lastWord.slice(1);
      
      try {
        const { data } = await mentionService.searchUsers(query);
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (nickname: string) => {
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    
    const words = textBeforeCursor.split(/\s/);
    words[words.length - 1] = nickname;
    
    const newContent = words.join(' ') + textAfterCursor;
    onChange(newContent);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const renderPreview = (text: string) => {
    const parts = text.split(/(@\w+|#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-green-500 font-medium">
            {part}
          </span>
        );
      } else if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleContentChange}
        placeholder={placeholder}
        className={className}
        rows={rows}
        maxLength={maxLength}
      />
      
      {/* Suggestions d'autocomplétion */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSuggestionClick(user.nickname)}
              className="p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {user.nickname.charAt(1).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="font-medium text-blue-600">{user.nickname}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Aperçu avec mentions et hashtags colorés */}
      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
          <span className="text-gray-600">Aperçu: </span>
          {renderPreview(value)}
        </div>
      )}
    </div>
  );
}