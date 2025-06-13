import { useState, useEffect, useCallback } from 'react';
import { hashtagService } from '@/services/supabase/hashtag';
import { HashtagSubscription, HashtagBlock } from '@/types';

export const useHashtags = (profileId: string | null) => {
  const [subscriptions, setSubscriptions] = useState<HashtagSubscription[]>([]);
  const [blocks, setBlocks] = useState<HashtagBlock[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserHashtags = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      const [subsData, blocksData] = await Promise.all([
        hashtagService.getUserSubscriptions(profileId),
        hashtagService.getUserBlocks(profileId)
      ]);

      setSubscriptions(subsData.data || []);
      setBlocks(blocksData.data || []);
    } catch {
      // Erreur lors du chargement des hashtags
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetchUserHashtags();
  }, [fetchUserHashtags]);

  const subscribeToHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.subscribeToHashtag(profileId, hashtagId);
      fetchUserHashtags();
    } catch {
      // Erreur lors de l'abonnement
    }
  };

  const unsubscribeFromHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.unsubscribeFromHashtag(profileId, hashtagId);
      fetchUserHashtags();
    } catch {
      // Erreur lors du désabonnement
    }
  };

  const blockHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.blockHashtag(profileId, hashtagId);
      fetchUserHashtags();
    } catch {
      // Erreur lors du blocage
    }
  };

  const unblockHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.unblockHashtag(profileId, hashtagId);
      fetchUserHashtags();
    } catch {
      // Erreur lors du déblocage
    }
  };

  return {
    subscriptions,
    blocks,
    loading,
    subscribeToHashtag,
    unsubscribeFromHashtag,
    blockHashtag,
    unblockHashtag,
    refreshHashtags: fetchUserHashtags
  };
};