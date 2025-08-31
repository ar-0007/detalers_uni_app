import { subscriptionAPI, getCurrentApiUrl } from './api';

// Badge types based on subscription status
export enum BadgeType {
  PREMIUM_MEMBER = 'PREMIUM_MEMBER',
  REGULAR_USER = 'REGULAR_USER',
  ADMIN = 'ADMIN'
}

// Badge configuration
export interface Badge {
  type: BadgeType;
  label: string;
  color: string;
  icon: string;
  description: string;
}

// Badge definitions
export const BADGE_CONFIG: Record<BadgeType, Badge> = {
  [BadgeType.PREMIUM_MEMBER]: {
    type: BadgeType.PREMIUM_MEMBER,
    label: 'Premium Member',
    color: '#FFD700', // Gold
    icon: '✨',
    description: 'Active subscription holder with premium access'
  },
  [BadgeType.REGULAR_USER]: {
    type: BadgeType.REGULAR_USER,
    label: 'Regular User',
    color: '#6B7280', // Gray
    icon: '👤',
    description: 'Standard user with basic access'
  },
  [BadgeType.ADMIN]: {
    type: BadgeType.ADMIN,
    label: 'Administrator',
    color: '#DC2626', // Red
    icon: '👑',
    description: 'System administrator with full access'
  }
};

// Subscription interfaces
interface RegularSubscription {
  subscription_id: string;
  user_id: string;
  subscription_type: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  amount_paid: number;
  auto_renew: boolean;
}

interface GuestSubscription {
  subscription_id: string;
  customer_email: string;
  customer_name: string;
  subscription_type: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  price: number;
  payment_status: string;
}

interface SubscriptionData {
  regularSubs: RegularSubscription[];
  guestSubs: GuestSubscription[];
}

interface UserData {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ADMIN';
  is_active: boolean;
}

// Badge service class
class BadgeService {
  private subscriptionCache: Map<string, { badge: Badge; expiresAt: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Determines user badge based on subscription status
   * Uses the same logic as fetchAllUsers.js script
   */
  async getUserBadge(user: UserData): Promise<Badge> {
    try {
      // Check cache first
      const cacheKey = `${user.user_id}_${user.email}`;
      const cached = this.subscriptionCache.get(cacheKey);
      
      if (cached && Date.now() < cached.expiresAt) {
        return cached.badge;
      }

      // Admin users get admin badge
      if (user.role === 'ADMIN') {
        const adminBadge = BADGE_CONFIG[BadgeType.ADMIN];
        this.cacheUserBadge(cacheKey, adminBadge);
        return adminBadge;
      }

      // Fetch subscription data
      const subscriptionData = await this.fetchUserSubscriptionData(user);
      const badge = this.determineBadgeFromSubscriptions(user, subscriptionData);
      
      // Cache the result
      this.cacheUserBadge(cacheKey, badge);
      
      return badge;
    } catch (error) {
      console.error('Error determining user badge:', error);
      // Return regular user badge as fallback
      return BADGE_CONFIG[BadgeType.REGULAR_USER];
    }
  }

  /**
   * Fetches subscription data for a specific user
   */
  private async fetchUserSubscriptionData(user: UserData): Promise<SubscriptionData> {
    try {
      // Fetch regular subscriptions for this user
      const regularSubsResponse = await subscriptionAPI.getUserSubscriptions(user.user_id);
      const regularSubs = regularSubsResponse.data || [];

      // Fetch guest subscriptions by email
      const guestSubsResponse = await subscriptionAPI.getGuestSubscriptionsByEmail(user.email);
      const guestSubs = guestSubsResponse.data || [];

      return {
        regularSubs,
        guestSubs
      };
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      return {
        regularSubs: [],
        guestSubs: []
      };
    }
  }

  /**
   * Determines badge based on subscription data
   * Implements the same logic as the fetchAllUsers.js script
   */
  private determineBadgeFromSubscriptions(user: UserData, subscriptionData: SubscriptionData): Badge {
    const { regularSubs, guestSubs } = subscriptionData;

    // Filter active subscriptions
    const activeRegularSubs = regularSubs.filter(s => s.status === 'ACTIVE');
    const activeGuestSubs = guestSubs.filter(s => s.status === 'ACTIVE');

    // Check if user has active regular subscription
    const hasActiveRegularSub = activeRegularSubs.some(s => s.user_id === user.user_id);
    
    // Check if user has active guest subscription
    const hasActiveGuestSub = activeGuestSubs.some(s => s.customer_email === user.email);

    // User is premium if they have any active subscription
    if (hasActiveRegularSub || hasActiveGuestSub) {
      return BADGE_CONFIG[BadgeType.PREMIUM_MEMBER];
    }

    // Default to regular user
    return BADGE_CONFIG[BadgeType.REGULAR_USER];
  }

  /**
   * Cache user badge with expiration
   */
  private cacheUserBadge(cacheKey: string, badge: Badge): void {
    this.subscriptionCache.set(cacheKey, {
      badge,
      expiresAt: Date.now() + this.CACHE_DURATION
    });
  }

  /**
   * Clear cache for a specific user
   */
  clearUserCache(userId: string, email: string): void {
    const cacheKey = `${userId}_${email}`;
    this.subscriptionCache.delete(cacheKey);
  }

  /**
   * Clear all cached badges
   */
  clearAllCache(): void {
    this.subscriptionCache.clear();
  }

  /**
   * Get badge configuration by type
   */
  getBadgeConfig(type: BadgeType): Badge {
    return BADGE_CONFIG[type];
  }

  /**
   * Get all available badge types
   */
  getAllBadgeTypes(): BadgeType[] {
    return Object.values(BadgeType);
  }

  /**
   * Check if a badge represents premium membership
   */
  isPremiumBadge(badge: Badge): boolean {
    return badge.type === BadgeType.PREMIUM_MEMBER;
  }

  /**
   * Get subscription details for premium users
   */
  async getSubscriptionDetails(user: UserData): Promise<{
    subscriptionType?: string;
    endDate?: string;
    source?: 'Regular' | 'Guest';
  } | null> {
    try {
      const subscriptionData = await this.fetchUserSubscriptionData(user);
      const { regularSubs, guestSubs } = subscriptionData;

      // Check active subscriptions
      const activeRegularSubs = regularSubs.filter(s => s.status === 'ACTIVE');
      const activeGuestSubs = guestSubs.filter(s => s.status === 'ACTIVE');

      // Find user's active subscription
      const userRegularSub = activeRegularSubs.find(s => s.user_id === user.user_id);
      const userGuestSub = activeGuestSubs.find(s => s.customer_email === user.email);

      if (userRegularSub) {
        return {
          subscriptionType: userRegularSub.subscription_type,
          endDate: new Date(userRegularSub.end_date).toLocaleDateString(),
          source: 'Regular'
        };
      }

      if (userGuestSub) {
        return {
          subscriptionType: userGuestSub.subscription_type,
          endDate: new Date(userGuestSub.end_date).toLocaleDateString(),
          source: 'Guest'
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      return null;
    }
  }

  /**
   * Fetch user badge from the new backend API endpoint
   */
  async getUserBadgeFromAPI(userEmail: string): Promise<{
    badge_name: string;
    badge_type: string;
    description: string;
    color: string;
    icon: string;
    earned_at: string;
  } | null> {
    try {
      // Get the current API base URL dynamically
      const apiBaseUrl = getCurrentApiUrl();
      const response = await fetch(`${apiBaseUrl}/users/categorized-with-badges?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data.badgeAssignment && data.data.badgeAssignment.badge) {
        return data.data.badgeAssignment.badge.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user badge from API:', error);
      return null;
    }
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
export default badgeService;