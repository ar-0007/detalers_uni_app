import { Dispatch } from '@reduxjs/toolkit';
import { subscriptionAPI } from '../../services/api';
import {
  fetchSubscriptionStart,
  fetchSubscriptionSuccess,
  fetchSubscriptionFailure,
  updateSubscriptionStatus,
  unlockAllContent,
  clearSubscriptionData,
  Subscription,
  SubscriptionBenefits,
} from '../slices/subscriptionSlice';
import { RootState } from '../index';

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Check if subscription data is still fresh
 */
const isSubscriptionDataFresh = (lastChecked: number | null): boolean => {
  if (!lastChecked) return false;
  return Date.now() - lastChecked < CACHE_DURATION;
};

/**
 * Fetch user's subscription status and benefits
 */
export const fetchUserSubscription = (forceRefresh = false) => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    try {
      const state = getState();
      const { lastChecked, isLoading } = state.subscription;
      
      // Skip if data is fresh and not forcing refresh
      if (!forceRefresh && isSubscriptionDataFresh(lastChecked) && !isLoading) {
        return;
      }
      
      // Skip if already loading
      if (isLoading) {
        return;
      }
      
      dispatch(fetchSubscriptionStart());
      
      // Fetch subscription status
      const subscriptionResponse = await subscriptionAPI.getUserSubscription();
      
      if (subscriptionResponse.success && subscriptionResponse.data) {
        const { subscription, hasActiveSubscription } = subscriptionResponse.data;
        
        // Fetch subscription benefits if user has active subscription
        let benefits: SubscriptionBenefits | null = null;
        if (hasActiveSubscription) {
          try {
            // This would be a new API endpoint for subscription benefits
            // For now, we'll set default benefits
            benefits = {
              allCoursesUnlocked: true,
              freeMentorshipBookings: {
                available: 1,
                used: 0,
                remaining: 1,
              },
            };
          } catch (benefitsError) {
            console.warn('Failed to fetch subscription benefits:', benefitsError);
          }
        }
        
        dispatch(fetchSubscriptionSuccess({
          subscription: subscription || null,
          hasActiveSubscription,
          benefits,
        }));
        
        // If user has active subscription, unlock all content
        if (hasActiveSubscription) {
          dispatch(unlockAllContentForSubscriber() as any);
        }
      } else {
        dispatch(fetchSubscriptionSuccess({
          subscription: null,
          hasActiveSubscription: false,
          benefits: null,
        }));
      }
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      dispatch(fetchSubscriptionFailure(
        error.response?.data?.message || error.message || 'Failed to fetch subscription data'
      ));
    }
  };
};

/**
 * Check subscription status (lightweight check)
 */
export const checkSubscriptionStatus = () => {
  return async (dispatch: Dispatch) => {
    try {
      const response = await subscriptionAPI.getMySubscriptionStatus();
      
      if (response.success && response.data) {
        dispatch(updateSubscriptionStatus({
          hasActiveSubscription: response.data.hasActiveSubscription,
        }));
        
        // If subscription is active, ensure content is unlocked
        if (response.data.hasActiveSubscription) {
          dispatch(unlockAllContentForSubscriber() as any);
        }
      }
    } catch (error: any) {
      console.error('Error checking subscription status:', error);
    }
  };
};

/**
 * Unlock all content for active subscribers
 */
export const unlockAllContentForSubscriber = () => {
  return async (dispatch: Dispatch) => {
    try {
      // In a real implementation, you might fetch all course and chapter IDs
      // For now, we'll use a placeholder approach
      // This could be enhanced to fetch actual course/chapter lists
      
      // Placeholder: This would typically fetch all published courses and chapters
      const courseIds: string[] = []; // Would be populated from API
      const chapterIds: string[] = []; // Would be populated from API
      
      dispatch(unlockAllContent({ courseIds, chapterIds }));
    } catch (error: any) {
      console.error('Error unlocking content for subscriber:', error);
    }
  };
};

/**
 * Clear subscription data (on logout)
 */
export const clearSubscription = () => {
  return (dispatch: Dispatch) => {
    dispatch(clearSubscriptionData());
  };
};

/**
 * Validate subscription access for specific content
 */
export const validateContentAccess = (contentId: string, contentType: 'course' | 'chapter') => {
  return (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const { hasActiveSubscription, unlockedCourses, unlockedChapters } = state.subscription;
    
    // If user has active subscription, they have access to all content
    if (hasActiveSubscription) {
      return true;
    }
    
    // Check if specific content is unlocked (for non-subscribers)
    if (contentType === 'course') {
      return unlockedCourses.includes(contentId);
    } else {
      return unlockedChapters.includes(contentId);
    }
  };
};

/**
 * Check if subscription has expired and handle gracefully
 */
export const handleSubscriptionExpiration = () => {
  return async (dispatch: Dispatch, getState: () => RootState) => {
    const state = getState();
    const { subscription } = state.subscription;
    
    if (subscription && subscription.status === 'ACTIVE') {
      const endDate = new Date(subscription.end_date);
      const now = new Date();
      
      if (endDate <= now) {
        // Subscription has expired, update status
        dispatch(updateSubscriptionStatus({
          hasActiveSubscription: false,
          subscription: { ...subscription, status: 'EXPIRED' },
        }));
        
        // Clear unlocked content
        dispatch(unlockAllContent({ courseIds: [], chapterIds: [] }));
        
        // You might want to show a notification here
        console.log('Subscription has expired');
      }
    }
  };
};