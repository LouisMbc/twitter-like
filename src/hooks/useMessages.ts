// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messageService } from '@/services/supabase/message';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface Contact {
  id: string;
  nickname: string;
  profilePicture?: string;
}

interface Conversation {
  id: string;
  nickname: string;
  profilePicture?: string;
  user?: Contact;
  lastMessage?: Message;
  unreadCount: number;
  last_message_at?: string;
}

export const useMessages = () => {
  const { profile } = useProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await messageService.getConversations(profile.id);
      if (error) throw error;
      
      setConversations((data || []) as Conversation[]);
    } catch {
      setError('Impossible de charger vos conversations');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const fetchMessages = useCallback(async (otherUser: Contact) => {
    if (!profile || !otherUser) return;
    
    setLoading(true);
    setCurrentContact(otherUser);
    
    try {
      const { data, error } = await messageService.getMessages(profile.id, otherUser.id);
      if (error) throw error;
      
      setCurrentMessages((data || []) as Message[]);
      
      await messageService.markAsRead(profile.id, otherUser.id);
      
      fetchConversations();
    } catch {
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [profile, fetchConversations]);

  const sendMessage = useCallback(async (recipientId: string, content: string): Promise<boolean> => {
    if (!profile || !content.trim()) return false;
    
    setSendingMessage(true);
    try {
      const { error } = await messageService.sendMessage(profile.id, recipientId, content);
      if (error) throw error;
      
      setCurrentMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender_id: profile.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
        is_read: false
      }]);
      
      fetchConversations();
      
      return true;
    } catch {
      setError('Impossible d\'envoyer le message');
      return false;
    } finally {
      setSendingMessage(false);
    }
  }, [profile, fetchConversations]);

  const checkCanMessage = useCallback(async (userId: string): Promise<boolean> => {
    if (!profile) return false;
    
    try {
      const { canMessage } = await messageService.canMessage(profile.id, userId);
      return canMessage;
    } catch {
      return false;
    }
  }, [profile]);

  const searchMessagableUsers = useCallback(async (query: string): Promise<Contact[]> => {
    if (!profile || !query.trim()) return [];
    
    try {
      const { data, error } = await messageService.searchMessagableUsers(profile.id, query);
      if (error) throw error;
      
      return (data || []) as Contact[];
    } catch {
      setError('Impossible de rechercher les utilisateurs');
      return [];
    }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'Messages',
        filter: `recipient_id=eq.${profile.id}`
      }, (payload) => {
        if (currentContact && payload.new.sender_id === currentContact.id) {
          setCurrentMessages(prev => [...prev, payload.new as Message]);
          messageService.markAsRead(profile.id, currentContact.id);
        }
        
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile, currentContact, fetchConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { 
    conversations, 
    currentMessages, 
    currentContact, 
    loading, 
    sendingMessage, 
    error, 
    fetchMessages, 
    sendMessage, 
    checkCanMessage,
    searchMessagableUsers
  };
};