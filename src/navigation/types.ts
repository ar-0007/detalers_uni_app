import { Course } from '../services/api';

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Main: undefined;
  Checkout: { purchaseId: string };
  MentorshipCheckout: { bookingId: string };
  CoursePlayer: { course: Course };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Courses: undefined;
  Mentorship: undefined;
  Calendar: undefined;
  Profile: undefined;
};