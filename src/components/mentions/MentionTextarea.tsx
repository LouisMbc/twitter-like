"use client";

import { useState, useRef, KeyboardEvent } from 'react';
import { mentionService, Mention } from '@/services/supabase/mention';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder = "Quoi de neuf ?",
  className = "",
  disabled = false
}: MentionTextareaProps) {
  const [suggestions, setSuggestions] = useState<Mention[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Détecter les mentions (@)
    const cursorPosition = e.target.selectionStart;
    const textUpToCursor = newValue.slice(0, cursorPosition);
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      if (query.length >= 0) {
        const response = await mentionService.searchUsers(query);
        const users = Array.isArray(response) ? response : (response.data || []);
        setSuggestions(users);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(0);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectSuggestion(suggestions[selectedSuggestionIndex]);
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const selectSuggestion = (suggestion: Mention) => {
    if (!textareaRef.current) return;

    const cursorPosition = textareaRef.current.selectionStart;
    const textUpToCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    
    const mentionMatch = textUpToCursor.match(/@(\w*)$/);
    if (!mentionMatch) return;

    const beforeMention = textUpToCursor.slice(0, mentionMatch.index);
    const newValue = beforeMention + `@${suggestion.nickname} ` + textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    setSuggestions([]);

    // Replacer le curseur après la mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPosition = beforeMention.length + suggestion.nickname.length + 2;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`resize-none ${className}`}
        rows={3}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`px-4 py-2 cursor-pointer flex items-center space-x-3 ${
                index === selectedSuggestionIndex
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600">
                {suggestion.profilePicture ? (
                  <img
                    src={suggestion.profilePicture}
                    alt={suggestion.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-medium">
                    {suggestion.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-gray-900 dark:text-white">@{suggestion.nickname}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}