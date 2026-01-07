import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'scam-or-legit-subscription';

interface SubscriptionData {
  email: string;
  subscribed: boolean;
  subscription_end: string | null;
  checked_at: string;
}

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load cached subscription on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const data: SubscriptionData = JSON.parse(cached);
        // Check if cache is less than 1 hour old
        const cacheAge = Date.now() - new Date(data.checked_at).getTime();
        if (cacheAge < 60 * 60 * 1000) {
          setIsSubscribed(data.subscribed);
          setSubscriptionEnd(data.subscription_end);
          setSubscriberEmail(data.email);
        }
      } catch (e) {
        console.error('Error loading subscription cache:', e);
      }
    }
  }, []);

  const checkSubscription = useCallback(async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { email },
      });

      if (error) {
        console.error('Subscription check error:', error);
        return false;
      }

      const subscribed = data?.subscribed || false;
      setIsSubscribed(subscribed);
      setSubscriptionEnd(data?.subscription_end || null);
      setSubscriberEmail(email);

      // Cache the result
      const cacheData: SubscriptionData = {
        email,
        subscribed,
        subscription_end: data?.subscription_end || null,
        checked_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));

      return subscribed;
    } catch (e) {
      console.error('Error checking subscription:', e);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCustomerPortal = useCallback(async (email: string) => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { email },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (e) {
      console.error('Error opening customer portal:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSubscription = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsSubscribed(false);
    setSubscriptionEnd(null);
    setSubscriberEmail(null);
  }, []);

  return {
    isSubscribed,
    subscriptionEnd,
    subscriberEmail,
    isLoading,
    checkSubscription,
    openCustomerPortal,
    clearSubscription,
  };
}
