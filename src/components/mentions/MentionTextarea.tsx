"use client";

import React, { useState, useRef, useEffect } from 'react';
import { mentionService } from '@/services/supabase/mention';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

interface User {
  id: string;
  nickname: string;
  profilePicture?: string;
}

export default function MentionTextarea({ 
  value, 
  onChange, 
  placeholder, 
  className,
  rows = 4
}: MentionTextareaProps) {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Détecter les mentions en cours de frappe
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const cursorPos = textarea.selectionStart;
    
    // Chercher si on est en train de taper une mention
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setCursorPosition(cursorPos);
      
      if (query.length >= 1) {
        searchUsers(query);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [value]);

  const searchUsers = async (query: string) => {
    try {
      const { data, error } = await mentionService.searchUsers(query, 5);
      if (!error && data) {
        // Les nicknames sont maintenant stockés sans @, pas besoin de les nettoyer
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    }
  };

  const insertMention = (user: User) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = value;
    const mentionStart = text.lastIndexOf('@', cursorPosition - 1);
    const beforeMention = text.substring(0, mentionStart);
    const afterCursor = text.substring(cursorPosition);
    
    const newText = beforeMention + `@${user.nickname} ` + afterCursor;
    onChange(newText);
    
    setShowSuggestions(false);
    
    setTimeout(() => {
      const newCursorPos = mentionStart + user.nickname.length + 2;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertMention(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-64">
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
              onClick={() => insertMention(user)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 mr-3">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                    {user.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-gray-900 dark:text-white font-medium">
                @{user.nickname}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}