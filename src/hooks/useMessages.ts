// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messageService } from '@/services/supabase/message';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase'; 

// Define the types for our data structures
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
  lastMessage?: any;
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

  // Récupérer toutes les conversations
  const fetchConversations = useCallback(async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await messageService.getConversations(profile.id);
      if (error) throw error;
      
      console.log('Conversations récupérées:', data);
      setConversations((data || []) as Conversation[]);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger vos conversations');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Récupérer les messages d'une conversation spécifique
  const fetchMessages = useCallback(async (otherUser: Contact) => {
    if (!profile || !otherUser) return;
    
    setLoading(true);
    setCurrentContact(otherUser);
    
    try {
      const { data, error } = await messageService.getMessages(profile.id, otherUser.id);
      if (error) throw error;
      
      setCurrentMessages((data || []) as Message[]);
      
      // Marquer les messages comme lus
      await messageService.markAsRead(profile.id, otherUser.id);
      
      // Rafraîchir les conversations pour mettre à jour les compteurs
      fetchConversations();
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
      setError('Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  }, [profile, fetchConversations]);
  // Envoyer un nouveau message
  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    if (!profile || !content.trim()) return false;
    
    // Empêcher d'envoyer des messages à soi-même
    if (profile.id === recipientId) {
      setError('Impossible d\'envoyer un message à soi-même');
      return false;
    }
    
    setSendingMessage(true);
    try {
      const { data, error } = await messageService.sendMessage(profile.id, recipientId, content);
      if (error) throw error;
      
      // Ajouter le nouveau message à la conversation actuelle
      if (data && data[0]) {
        setCurrentMessages(prev => [...prev, data[0] as Message]);
      }
      
      // Rafraîchir les conversations
      fetchConversations();
      
      return true;
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError('Impossible d\'envoyer le message');
      return false;
    } finally {
      setSendingMessage(false);
    }
  }, [profile, fetchConversations]);
  // Vérifier si l'utilisateur peut envoyer un message à quelqu'un
  const checkCanMessage = useCallback(async (otherUserId: string) => {
    if (!profile) return false;
    
    // Empêcher les interactions avec soi-même
    if (profile.id === otherUserId) return false;
    
    try {
      const { canMessage, error } = await messageService.canMessage(profile.id, otherUserId);
      if (error) throw error;
      
      return canMessage;
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      return false;
    }
  }, [profile]);

  // Rechercher les utilisateurs avec qui on peut échanger des messages
  const searchMessagableUsers = useCallback(async (query: string = '') => {
    if (!profile) return [];
    
    try {
      const { data, error } = await messageService.searchMessagableUsers(profile.id, query);
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', err);
      setError('Impossible de rechercher les utilisateurs');
      return [];
    }
  }, [profile]);

  // Écouter les nouveaux messages en temps réel
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
        // Mettre à jour la conversation actuelle si nécessaire
        if (currentContact && payload.new.sender_id === currentContact.id) {
          setCurrentMessages(prev => [...prev, payload.new as Message]);
          messageService.markAsRead(profile.id, currentContact.id);
        }
        
        // Rafraîchir les conversations
        fetchConversations();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile, currentContact, fetchConversations]);

  // Charger les conversations au démarrage
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