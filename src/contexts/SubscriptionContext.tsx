import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { subscriptionService, ContentAccessResult, SubscriptionStatus } from '../services/subscriptionService';
import { fetchUserSubscription, checkSubscriptionStatus } from '../store/actions/subscriptionActions';
import { Subscription, SubscriptionBenefits } from '../store/slices/subscriptionSlice';
import { badgeService } from '../services/badgeService';

interface SubscriptionContextType {
  // Subscription data
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  benefits: SubscriptionBenefits | null;
  isLoading: boolean;
  error: string | null;
  
  // Subscription status
  subscriptionStatus: SubscriptionStatus;
  isExpiringSoon: boolean;
  
  // Content access methods
  checkCourseAccess: (courseId: string) => Promise<ContentAccessResult>;
  checkChapterAccess: (chapterId: string, courseId?: string) => Promise<ContentAccessResult>;
  validateNavigation: (contentType: 'course' | 'chapter', contentId: string, courseId?: string) => Promise<{
    canNavigate: boolean;
    reason?: string;
    suggestedAction?: 'login' | 'subscribe' | 'enroll' | 'purchase';
  }>;
  
  // Utility methods
  refreshSubscription: () => Promise<void>;
  getUnlockedCourses: () => string[];
  getUnlockedChapters: () => string[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const subscriptionState = useSelector((state: RootState) => state.subscription);
  const authState = useSelector((state: RootState) => state.auth);
  
  const {
    subscription,
    hasActiveSubscription,
    benefits,
    isLoading,
    error,
    unlockedCourses,
    unlockedChapters,
  } = subscriptionState;

  // Initialize subscription service when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      subscriptionService.initialize();
    }
  }, [authState.isAuthenticated, authState.user]);

  // Fetch subscription data when user logs in
  useEffect(() => {
    if (authState.isAuthenticated && !subscription && !isLoading) {
      dispatch(fetchUserSubscription(true) as any); // Force refresh to check badge status
    }
  }, [authState.isAuthenticated, subscription, isLoading, dispatch]);

  // Force refresh subscription status when user becomes authenticated (for existing badge holders)
   useEffect(() => {
     if (authState.isAuthenticated && authState.user?.email) {
       console.log('🔄 Force checking subscription status for authenticated user:', authState.user.email);
       console.log('🔄 Current hasActiveSubscription:', hasActiveSubscription);
       
       // Force refresh immediately and periodically for users without active subscription
       const forceRefresh = () => {
         console.log('🔄 Executing force refresh...');
         dispatch(fetchUserSubscription(true) as any);
       };
       
       // Immediate refresh
       forceRefresh();
       
       // Additional refresh after 2 seconds if still no active subscription
       const timer = setTimeout(() => {
         if (!hasActiveSubscription) {
           console.log('🔄 Still no active subscription, trying again...');
           forceRefresh();
         }
       }, 2000);
       
       return () => clearTimeout(timer);
     }
   }, [authState.isAuthenticated, authState.user?.email, dispatch]); // Removed hasActiveSubscription dependency to avoid infinite loop

  // Additional effect to check badge status periodically for premium users
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.email) {
      const checkBadgeStatus = async () => {
         try {
           console.log('🔍 SubscriptionContext: Checking badge status for user:', authState.user!.email);
           const userBadge = await badgeService.getUserBadgeFromAPI(authState.user!.email);
           const isPremiumMember = userBadge && (userBadge.badge_name === 'Premium Member' || userBadge.badge_name === 'Member');
           
           console.log('🔍 SubscriptionContext: Badge check result:', {
             userEmail: authState.user!.email,
             userBadge,
             isPremiumMember,
             currentHasActiveSubscription: hasActiveSubscription
           });
           
           // If user has premium badge but subscription context shows inactive, refresh
           if (isPremiumMember && !hasActiveSubscription) {
             console.log('✅ Premium badge detected but subscription inactive - refreshing subscription status');
             dispatch(checkSubscriptionStatus() as any);
           } else if (isPremiumMember && hasActiveSubscription) {
             console.log('✅ Premium badge detected and subscription already active');
           } else if (!isPremiumMember) {
             console.log('❌ No premium badge found for user');
           }
         } catch (error) {
           console.warn('❌ Error checking badge status in context:', error);
         }
       };

      // Check immediately
      checkBadgeStatus();
      
      // Set up periodic check every 2 minutes
      const interval = setInterval(checkBadgeStatus, 2 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, authState.user?.email, hasActiveSubscription, dispatch]);

  // Get subscription status
  const subscriptionStatus = subscriptionService.getSubscriptionStatus();
  const isExpiringSoon = subscriptionService.isSubscriptionExpiringSoon();

  // Content access methods
  const checkCourseAccess = async (courseId: string): Promise<ContentAccessResult> => {
    return subscriptionService.checkCourseAccess(courseId);
  };

  const checkChapterAccess = async (chapterId: string, courseId?: string): Promise<ContentAccessResult> => {
    return subscriptionService.checkChapterAccess(chapterId, courseId);
  };

  const validateNavigation = async (
    contentType: 'course' | 'chapter',
    contentId: string,
    courseId?: string
  ) => {
    return subscriptionService.validateNavigation(contentType, contentId, courseId);
  };

  // Utility methods
  const refreshSubscription = async (): Promise<void> => {
    await subscriptionService.refreshSubscription();
  };

  const getUnlockedCourses = (): string[] => {
    return unlockedCourses;
  };

  const getUnlockedChapters = (): string[] => {
    return unlockedChapters;
  };

  const contextValue: SubscriptionContextType = {
    // Subscription data
    subscription,
    hasActiveSubscription,
    benefits,
    isLoading,
    error,
    
    // Subscription status
    subscriptionStatus,
    isExpiringSoon,
    
    // Content access methods
    checkCourseAccess,
    checkChapterAccess,
    validateNavigation,
    
    // Utility methods
    refreshSubscription,
    getUnlockedCourses,
    getUnlockedChapters,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Custom hook to use subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Hook for checking content access with loading state
export const useContentAccess = (contentType: 'course' | 'chapter', contentId: string, courseId?: string) => {
  const { checkCourseAccess, checkChapterAccess } = useSubscription();
  const [accessResult, setAccessResult] = React.useState<ContentAccessResult | null>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      try {
        const result = contentType === 'course'
          ? await checkCourseAccess(contentId)
          : await checkChapterAccess(contentId, courseId);
        setAccessResult(result);
      } catch (error) {
        console.error('Error checking content access:', error);
        setAccessResult({
          hasAccess: false,
          accessType: 'none',
          reason: 'Error checking access',
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [contentType, contentId, courseId, checkCourseAccess, checkChapterAccess]);

  return { accessResult, isChecking };
};

// Hook for subscription status with automatic refresh
export const useSubscriptionStatus = () => {
  const { subscriptionStatus, isExpiringSoon, hasActiveSubscription, refreshSubscription } = useSubscription();
  
  // Auto-refresh subscription status every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (hasActiveSubscription) {
        refreshSubscription();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [hasActiveSubscription, refreshSubscription]);

  return {
    subscriptionStatus,
    isExpiringSoon,
    hasActiveSubscription,
    refreshSubscription,
  };
};