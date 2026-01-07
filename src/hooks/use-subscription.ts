// Subscription functionality removed - using affiliate model instead
// This file is kept for backwards compatibility but returns disabled state

export function useSubscription() {
  return {
    isSubscribed: false,
    subscriptionEnd: null,
    subscriberEmail: null,
    isLoading: false,
    checkSubscription: async () => false,
    openCustomerPortal: async () => {},
    clearSubscription: () => {},
  };
}
