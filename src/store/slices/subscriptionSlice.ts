import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Subscription {
  subscription_id: string;
  user_id?: string;
  customer_email?: string;
  subscription_type: 'MONTHLY' | '3_MONTH';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
  amount_paid: number;
  auto_renew: boolean;
  source: 'Regular' | 'Guest';
}

export interface SubscriptionBenefits {
  allCoursesUnlocked: boolean;
  freeMentorshipBookings: {
    available: number;
    used: number;
    remaining: number;
  };
}

interface SubscriptionState {
  subscription: Subscription | null;
  hasActiveSubscription: boolean;
  benefits: SubscriptionBenefits | null;
  isLoading: boolean;
  error: string | null;
  lastChecked: number | null;
  // Content access cache
  unlockedCourses: string[];
  unlockedChapters: string[];
}

const initialState: SubscriptionState = {
  subscription: null,
  hasActiveSubscription: false,
  benefits: null,
  isLoading: false,
  error: null,
  lastChecked: null,
  unlockedCourses: [],
  unlockedChapters: [],
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    fetchSubscriptionStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSubscriptionSuccess: (state, action: PayloadAction<{
      subscription: Subscription | null;
      hasActiveSubscription: boolean;
      benefits: SubscriptionBenefits | null;
    }>) => {
      state.isLoading = false;
      state.subscription = action.payload.subscription;
      state.hasActiveSubscription = action.payload.hasActiveSubscription;
      state.benefits = action.payload.benefits;
      state.lastChecked = Date.now();
      state.error = null;
      
      // If user has active subscription, mark all content as unlocked
      if (action.payload.hasActiveSubscription) {
        // This will be populated by content access middleware
        state.unlockedCourses = [];
        state.unlockedChapters = [];
      } else {
        // Clear unlocked content for non-subscribers
        state.unlockedCourses = [];
        state.unlockedChapters = [];
      }
    },
    fetchSubscriptionFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateSubscriptionStatus: (state, action: PayloadAction<{
      hasActiveSubscription: boolean;
      subscription?: Subscription | null;
    }>) => {
      state.hasActiveSubscription = action.payload.hasActiveSubscription;
      if (action.payload.subscription !== undefined) {
        state.subscription = action.payload.subscription;
      }
      state.lastChecked = Date.now();
    },
    unlockCourse: (state, action: PayloadAction<string>) => {
      const courseId = action.payload;
      if (!state.unlockedCourses.includes(courseId)) {
        state.unlockedCourses.push(courseId);
      }
    },
    unlockChapter: (state, action: PayloadAction<string>) => {
      const chapterId = action.payload;
      if (!state.unlockedChapters.includes(chapterId)) {
        state.unlockedChapters.push(chapterId);
      }
    },
    unlockAllContent: (state, action: PayloadAction<{
      courseIds: string[];
      chapterIds: string[];
    }>) => {
      state.unlockedCourses = [...new Set([...state.unlockedCourses, ...action.payload.courseIds])];
      state.unlockedChapters = [...new Set([...state.unlockedChapters, ...action.payload.chapterIds])];
    },
    clearSubscriptionData: (state) => {
      state.subscription = null;
      state.hasActiveSubscription = false;
      state.benefits = null;
      state.unlockedCourses = [];
      state.unlockedChapters = [];
      state.lastChecked = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchSubscriptionStart,
  fetchSubscriptionSuccess,
  fetchSubscriptionFailure,
  updateSubscriptionStatus,
  unlockCourse,
  unlockChapter,
  unlockAllContent,
  clearSubscriptionData,
  clearError,
} = subscriptionSlice.actions;

export default subscriptionSlice.reducer;