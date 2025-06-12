import { useState, useEffect } from 'react';
import { hashtagService } from '@/services/supabase/hashtag';
import { Hashtag, HashtagSubscription, HashtagBlock } from '@/types';

export const useHashtags = (profileId: string | null) => {
  const [subscriptions, setSubscriptions] = useState<HashtagSubscription[]>([]);
  const [blocks, setBlocks] = useState<HashtagBlock[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUserHashtags = async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      const [subsData, blocksData] = await Promise.all([
        hashtagService.getUserSubscriptions(profileId),
        hashtagService.getUserBlocks(profileId)
      ]);

      setSubscriptions(subsData.data || []);
      setBlocks(blocksData.data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserHashtags();
  }, [profileId]);

  const subscribeToHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.subscribeToHashtag(profileId, hashtagId);
      fetchUserHashtags(); // Rafraîchir la liste
    } catch (error) {
    }
  };

  const unsubscribeFromHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.unsubscribeFromHashtag(profileId, hashtagId);
      fetchUserHashtags(); // Rafraîchir la liste
    } catch (error) {
    }
  };

  const blockHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.blockHashtag(profileId, hashtagId);
      fetchUserHashtags(); // Rafraîchir la liste
    } catch (error) {
    }
  };

  const unblockHashtag = async (hashtagId: string) => {
    if (!profileId) return;

    try {
      await hashtagService.unblockHashtag(profileId, hashtagId);
      fetchUserHashtags(); // Rafraîchir la liste
    } catch (error) {
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