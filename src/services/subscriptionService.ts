import { store } from '../store';
import { subscriptionAPI, courseAPI } from './api';
import {
  fetchUserSubscription,
  checkSubscriptionStatus,
  validateContentAccess,
  handleSubscriptionExpiration,
} from '../store/actions/subscriptionActions';
import { unlockCourse, unlockChapter } from '../store/slices/subscriptionSlice';

export interface ContentAccessResult {
  hasAccess: boolean;
  accessType: 'subscription' | 'enrollment' | 'purchase' | 'none';
  reason?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  type?: 'MONTHLY' | '3_MONTH';
  endDate?: string;
  daysRemaining?: number;
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Initialize subscription service
   */
  public async initialize(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      // Fetch initial subscription data
      await store.dispatch(fetchUserSubscription() as any);
      
      // Set up periodic subscription checks
      this.setupPeriodicChecks();
      
      console.log('✅ Subscription service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize subscription service:', error);
    }
  }

  /**
   * Set up periodic subscription status checks
   */
  private setupPeriodicChecks(): void {
    // Check subscription status every 5 minutes
    setInterval(() => {
      store.dispatch(checkSubscriptionStatus() as any);
    }, 5 * 60 * 1000);

    // Check for expiration every hour
    setInterval(() => {
      store.dispatch(handleSubscriptionExpiration() as any);
    }, 60 * 60 * 1000);
  }

  /**
   * Check if user has access to specific course
   */
  public async checkCourseAccess(courseId: string): Promise<ContentAccessResult> {
    try {
      const state = store.getState();
      const { hasActiveSubscription, unlockedCourses } = state.subscription;
      const { isAuthenticated } = state.auth;

      // If user has active subscription, grant access
      if (hasActiveSubscription) {
        // Ensure course is marked as unlocked
        store.dispatch(unlockCourse(courseId));
        return {
          hasAccess: true,
          accessType: 'subscription',
          reason: 'Active subscription grants access to all courses',
        };
      }

      // Check if course is already unlocked (via enrollment or purchase)
      if (unlockedCourses.includes(courseId)) {
        return {
          hasAccess: true,
          accessType: 'enrollment',
          reason: 'Course unlocked via enrollment or purchase',
        };
      }

      // For authenticated users, check enrollment status
      if (isAuthenticated) {
        // This would typically check enrollment API
        // For now, we'll return no access
        return {
          hasAccess: false,
          accessType: 'none',
          reason: 'Course not unlocked. Subscription or enrollment required.',
        };
      }

      return {
        hasAccess: false,
        accessType: 'none',
        reason: 'Authentication required',
      };
    } catch (error) {
      console.error('Error checking course access:', error);
      return {
        hasAccess: false,
        accessType: 'none',
        reason: 'Error checking access',
      };
    }
  }

  /**
   * Check if user has access to specific chapter
   */
  public async checkChapterAccess(chapterId: string, courseId?: string): Promise<ContentAccessResult> {
    try {
      const state = store.getState();
      const { hasActiveSubscription, unlockedChapters } = state.subscription;

      // If user has active subscription, grant access
      if (hasActiveSubscription) {
        // Ensure chapter is marked as unlocked
        store.dispatch(unlockChapter(chapterId));
        return {
          hasAccess: true,
          accessType: 'subscription',
          reason: 'Active subscription grants access to all chapters',
        };
      }

      // Check if chapter is already unlocked
      if (unlockedChapters.includes(chapterId)) {
        return {
          hasAccess: true,
          accessType: 'enrollment',
          reason: 'Chapter unlocked via course access',
        };
      }

      // If course ID is provided, check course access first
      if (courseId) {
        const courseAccess = await this.checkCourseAccess(courseId);
        if (courseAccess.hasAccess) {
          // If user has course access, unlock the chapter
          store.dispatch(unlockChapter(chapterId));
          return {
            hasAccess: true,
            accessType: courseAccess.accessType,
            reason: 'Chapter access granted via course access',
          };
        }
      }

      return {
        hasAccess: false,
        accessType: 'none',
        reason: 'Chapter not unlocked. Course access required.',
      };
    } catch (error) {
      console.error('Error checking chapter access:', error);
      return {
        hasAccess: false,
        accessType: 'none',
        reason: 'Error checking access',
      };
    }
  }

  /**
   * Get current subscription status
   */
  public getSubscriptionStatus(): SubscriptionStatus {
    const state = store.getState();
    const { hasActiveSubscription, subscription } = state.subscription;

    if (!hasActiveSubscription || !subscription) {
      return { isActive: false };
    }

    const endDate = new Date(subscription.end_date);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      isActive: true,
      type: subscription.subscription_type,
      endDate: subscription.end_date,
      daysRemaining: Math.max(0, daysRemaining),
    };
  }

  /**
   * Refresh subscription data
   */
  public async refreshSubscription(): Promise<void> {
    await store.dispatch(fetchUserSubscription(true) as any);
  }

  /**
   * Check if subscription is expiring soon (within 7 days)
   */
  public isSubscriptionExpiringSoon(): boolean {
    const status = this.getSubscriptionStatus();
    return status.isActive && (status.daysRemaining || 0) <= 7;
  }

  /**
   * Get subscription benefits summary
   */
  public getSubscriptionBenefits() {
    const state = store.getState();
    return state.subscription.benefits;
  }

  /**
   * Middleware function to check content access before navigation
   */
  public async validateNavigation(contentType: 'course' | 'chapter', contentId: string, courseId?: string): Promise<{
    canNavigate: boolean;
    reason?: string;
    suggestedAction?: 'login' | 'subscribe' | 'enroll' | 'purchase';
  }> {
    const state = store.getState();
    const { isAuthenticated } = state.auth;

    // Check authentication first
    if (!isAuthenticated) {
      return {
        canNavigate: false,
        reason: 'Please log in to access this content',
        suggestedAction: 'login',
      };
    }

    // Check content access
    const accessResult = contentType === 'course' 
      ? await this.checkCourseAccess(contentId)
      : await this.checkChapterAccess(contentId, courseId);

    if (accessResult.hasAccess) {
      return { canNavigate: true };
    }

    // Determine suggested action based on current subscription status
    const { hasActiveSubscription } = state.subscription;
    const suggestedAction = hasActiveSubscription ? 'enroll' : 'subscribe';

    return {
      canNavigate: false,
      reason: accessResult.reason,
      suggestedAction,
    };
  }
}

// Export singleton instance
export const subscriptionService = SubscriptionService.getInstance();
export default subscriptionService;