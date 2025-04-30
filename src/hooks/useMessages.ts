// src/hooks/useMessages.ts
import { useState, useEffect, useCallback } from 'react';
import { messageService } from '@/services/supabase/message';
import { useProfile } from '@/hooks/useProfile';
import supabase from '@/lib/supabase'; 

export const useMessages = () => {
  const { profile } = useProfile();
  const [conversations, setConversations] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [currentContact, setCurrentContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer toutes les conversations
  const fetchConversations = useCallback(async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await messageService.getConversations(profile.id);
      if (error) throw error;
      
      setConversations(data || []);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setError('Impossible de charger vos conversations');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Récupérer les messages d'une conversation spécifique
  const fetchMessages = useCallback(async (otherUser) => {
    if (!profile || !otherUser) return;
    
    setLoading(true);
    setCurrentContact(otherUser);
    
    try {
      const { data, error } = await messageService.getMessages(profile.id, otherUser.id);
      if (error) throw error;
      
      setCurrentMessages(data || []);
      
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
  const sendMessage = useCallback(async (recipientId, content) => {
    if (!profile || !content.trim()) return;
    
    setSendingMessage(true);
    try {
      const { data, error } = await messageService.sendMessage(profile.id, recipientId, content);
      if (error) throw error;
      
      // Ajouter le nouveau message à la conversation actuelle
      setCurrentMessages(prev => [...prev, data[0]]);
      
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
  const checkCanMessage = useCallback(async (otherUserId) => {
    if (!profile) return false;
    
    try {
      const { canMessage, error } = await messageService.canMessage(profile.id, otherUserId);
      if (error) throw error;
      
      return canMessage;
    } catch (err) {
      console.error('Erreur lors de la vérification des permissions:', err);
      return false;
    }
  }, [profile]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!profile) return;
    
    // Utilisez supabase (importé par défaut) et non supabase.supabase
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
          setCurrentMessages(prev => [...prev, payload.new]);
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
    checkCanMessage 
  };
};