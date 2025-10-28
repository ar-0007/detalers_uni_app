import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { tokenStorage } from '../utils/storage';

// API Configuration - Dynamic based on platform and environment
const getApiBaseUrl = () => {
  // For development, you can change this based on your setup
  const isDevelopment = __DEV__;
  
  if (isDevelopment) {
    // Using production backend for development as well
    return 'https://universitybackend-production-9ffe.up.railway.app/api';
    // Alternative: Use local development server if available
    // return 'http://192.168.10.10:4000/api';
  }
  
  // Production URL
  return 'https://universitybackend-production-9ffe.up.railway.app/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug logging
console.log('API Base URL:', API_BASE_URL);

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await tokenStorage.removeToken();
      // You might want to redirect to login here
    }
    return Promise.reject(error);
  }
);

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  course_id: string;
  title: string;
  description?: string;
  price?: number;
  category_id?: string;
  instructor_id?: string;
  duration_hours?: number;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  is_published: boolean;
  thumbnail_url?: string;
  intro_video_url?: string;
  video_series?: string;
  video_part?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  category_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface VideoSeries {
  series_id: string;
  title: string;
  description?: string;
  video_url?: string; // Add video URL
  thumbnail_url?: string; // Add thumbnail URL
  duration?: string; // Add duration
  created_at: string;
  created_by?: string; // Admin who uploaded
}

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// User API functions
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },

  getAllUsers: async (page = 1, limit = 20): Promise<ApiResponse<{ users: User[]; total: number; page: number; totalPages: number }>> => {
    const response = await api.get(`/users?page=${page}&limit=${limit}`);
    return response.data;
  },

  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (userData: { email: string; firstName: string; lastName: string; role: 'STUDENT' | 'ADMIN' }): Promise<ApiResponse<User>> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId: string): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/users/${userId}/toggle-status`);
    return response.data;
  },
};

// Course API functions
export const courseAPI = {
  getAllCourses: async (isPublished?: boolean): Promise<ApiResponse<Course[]>> => {
    const params = isPublished !== undefined ? { isPublished: isPublished.toString() } : {};
    const response = await api.get('/courses', { params });
    return response.data;
  },

  getCourseById: async (courseId: string): Promise<ApiResponse<Course>> => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (courseData: FormData): Promise<ApiResponse<Course>> => {
    const response = await api.post('/courses', courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateCourse: async (courseId: string, courseData: FormData): Promise<ApiResponse<Course>> => {
    const response = await api.put(`/courses/${courseId}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCourse: async (courseId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get('/courses/categories');
    return response.data;
  },

  createCategory: async (categoryData: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    const response = await api.post('/courses/categories', categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/courses/categories/${categoryId}`);
    return response.data;
  },

  getVideoSeries: async (): Promise<ApiResponse<VideoSeries[]>> => {
    const response = await api.get('/courses/video-series');
    return response.data;
  },

  getCoursesBySeries: async (seriesName: string): Promise<ApiResponse<Course[]>> => {
    const response = await api.get(`/courses/series/${encodeURIComponent(seriesName)}`);
    return response.data;
  },
};

// Enrollment API functions
export const enrollmentAPI = {
  enrollInCourse: async (courseId: string): Promise<ApiResponse> => {
    const response = await api.post('/enrollments', { course_id: courseId });
    return response.data;
  },

  getEnrollments: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/enrollments');
    return response.data;
  },

  getEnrollmentByCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/enrollments/course/${courseId}`);
    return response.data;
  },

  // Fix this function to use the new endpoint
  getUserEnrolledCourses: async (): Promise<ApiResponse<Course[]>> => {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  },
};

// Progress API functions
export const progressAPI = {
  updateProgress: async (courseId: string, chapterId: string, progress: number): Promise<ApiResponse> => {
    const response = await api.post('/progress', {
      course_id: courseId,
      chapter_id: chapterId,
      progress_percentage: progress,
    });
    return response.data;
  },

  getProgress: async (courseId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data;
  },
};



// Quiz and Assignment Types
export interface Quiz {
  quiz_id: string;
  chapter_id: string;
  title: string;
  description?: string;
  questions_data: any;
  created_at: string;
  updated_at: string;
  chapter?: {
    chapter_id: string;
    title: string;
    course_id: string;
  };
}

export interface QuizAttempt {
  attempt_id: string;
  quiz_id: string;
  user_id: string;
  answers_data: any;
  score?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  assignment_id: string;
  course_id?: string;
  chapter_id?: string;
  title: string;
  description?: string;
  assignment_file_url?: string;
  max_score?: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
  course?: {
    course_id: string;
    title: string;
  };
  chapter?: {
    chapter_id: string;
    title: string;
    course_id: string;
  };
}

export interface Submission {
  submission_id: string;
  assignment_id: string;
  user_id: string;
  submission_file_url?: string;
  submission_text?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  created_at: string;
  updated_at: string;
}

// Quiz API functions
export const quizAPI = {
  getQuizzesByChapter: async (chapterId: string): Promise<ApiResponse<Quiz[]>> => {
    const response = await api.get(`/quizzes/chapter/${chapterId}`);
    return response.data;
  },

  getQuizzesByCourse: async (courseId: string): Promise<ApiResponse<Quiz[]>> => {
    const response = await api.get(`/quizzes/course/${courseId}`);
    return response.data;
  },

  getQuizById: async (quizId: string): Promise<ApiResponse<Quiz>> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  submitQuizAttempt: async (quizId: string, answersData: any): Promise<ApiResponse<QuizAttempt>> => {
    const response = await api.post(`/quizzes/${quizId}/attempts`, {
      answers_data: answersData
    });
    return response.data;
  },

  getMyQuizAttempts: async (quizId: string): Promise<ApiResponse<QuizAttempt[]>> => {
    const response = await api.get(`/quizzes/${quizId}/my-attempts`);
    return response.data;
  },
};

// Assignment API functions
export const assignmentAPI = {
  getAssignments: async (courseId?: string, chapterId?: string): Promise<ApiResponse<Assignment[]>> => {
    const params: any = {};
    if (courseId) params.course_id = courseId;
    if (chapterId) params.chapter_id = chapterId;
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  getAssignmentsByCourse: async (courseId: string): Promise<ApiResponse<Assignment[]>> => {
    const response = await api.get(`/assignments?course_id=${courseId}`);
    return response.data;
  },

  getAssignmentsByChapter: async (chapterId: string): Promise<ApiResponse<Assignment[]>> => {
    const response = await api.get(`/assignments?chapter_id=${chapterId}`);
    return response.data;
  },

  getAssignmentById: async (assignmentId: string): Promise<ApiResponse<Assignment>> => {
    const response = await api.get(`/assignments/${assignmentId}`);
    return response.data;
  },

  submitAssignment: async (assignmentId: string, submissionData: FormData): Promise<ApiResponse<Submission>> => {
    const response = await api.post(`/assignments/${assignmentId}/submit`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMySubmissions: async (assignmentId: string): Promise<ApiResponse<Submission[]>> => {
    const response = await api.get(`/submissions?assignment_id=${assignmentId}`);
    return response.data;
  },

  submitAssignmentText: async (assignmentId: string, submissionText: string): Promise<ApiResponse<Submission>> => {
    const formData = new FormData();
    formData.append('assignment_id', assignmentId);
    formData.append('submission_text', submissionText);
    
    const response = await api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Upload API functions
export const uploadAPI = {
  uploadFile: async (file: FormData): Promise<ApiResponse<{ url: string }>> => {
    const response = await api.post('/uploads', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Payment API functions
export const paymentAPI = {
  createPaymentIntent: async (paymentData: any): Promise<ApiResponse<any>> => {
    const response = await api.post('/payments/create-intent', paymentData);
    return response.data;
  },

  confirmPayment: async (paymentIntentId: string): Promise<ApiResponse> => {
    const response = await api.post('/payments/confirm', { payment_intent_id: paymentIntentId });
    return response.data;
  },

  getPaymentHistory: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/payments/history');
    return response.data;
  },
};

// Guest Course Purchase API functions
export const guestCoursePurchaseAPI = {
  // DEPRECATED: Security risk - allows access to any user's courses
  getPurchasedCoursesByEmail: async (email: string): Promise<ApiResponse<Course[]>> => {
    const response = await api.get(`/guest-course-purchases/email/${encodeURIComponent(email)}`);
    return response.data;
  },
  
  // Secure endpoint - gets authenticated user's purchased courses
  getMyPurchasedCourses: async (): Promise<ApiResponse<Course[]>> => {
    const response = await api.get('/guest-course-purchases/my-courses');
    return response.data;
  },

  // Create a new course purchase
  createGuestCoursePurchase: async (purchaseData: {
    courseId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/guest-course-purchases', purchaseData);
    return response.data;
  },

  // Get purchase details by ID (for checkout)
  getGuestCoursePurchaseById: async (purchaseId: string): Promise<ApiResponse<any>> => {
    const response = await api.get(`/guest-course-purchases/${purchaseId}`);
    return response.data;
  },

  // Create payment intent for Stripe
  createPaymentIntent: async (purchaseId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/guest-course-purchases/create-payment-intent', {
      purchaseId
    });
    return response.data;
  },

  // Update payment status
  updatePaymentStatus: async (purchaseId: string, paymentData: {
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
    paymentMethod?: string;
    transactionId?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/guest-course-purchases/${purchaseId}/payment`, paymentData);
    return response.data;
  },
};

// Mentorship API types
export interface MentorshipSlot {
  slot_id: string;
  mentor_id: string;
  start_time: string;
  end_time: string;
  price: number;
  is_booked: boolean;
  mentor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface MentorshipBooking {
  booking_id: string;
  slot_id: string;
  user_id: string;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  scheduled_date: string;
  scheduled_time: string;
  instructor_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  meeting_link?: string;
}

export interface Instructor {
  instructor_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  hourly_rate: number;
}

// Mentorship API functions
export const mentorshipAPI = {
  // Get available slots for a specific instructor
  getAvailableSlots: async (instructorId: string): Promise<ApiResponse<MentorshipSlot[]>> => {
    const response = await api.get(`/public/mentorship/slots/${instructorId}`);
    return response.data;
  },

  // Get all instructors
  getAllInstructors: async (): Promise<ApiResponse<Instructor[]>> => {
    const response = await api.get('/instructors');
    return response.data;
  },

  // Create a mentorship booking with payment
  createBooking: async (bookingData: {
    instructorId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    preferredDate: string;
    preferredTime: string;
    message?: string;
    preferredTopics?: string[];
    sessionDuration?: number; // in hours, defaults to 1
  }): Promise<ApiResponse<{ booking: MentorshipBooking; bookingId: string }>> => {
    const response = await api.post('/public/mentorship/bookings', bookingData);
    return response.data;
  },

  // Create payment intent for mentorship booking
  createPaymentIntent: async (bookingId: string): Promise<ApiResponse<any>> => {
    const response = await api.post('/public/mentorship/bookings/create-payment-intent', {
      bookingId
    });
    return response.data;
  },

  // Get booking details by ID
  getBookingById: async (bookingId: string): Promise<ApiResponse<MentorshipBooking>> => {
    const response = await api.get(`/public/mentorship/bookings/${bookingId}`);
    return response.data;
  },

  // Get user's bookings (requires authentication)
  getMyBookings: async (): Promise<ApiResponse<MentorshipBooking[]>> => {
    const response = await api.get('/mentorship/my-bookings');
    return response.data;
  },
};

// Video Progress API
export const videoProgressAPI = {
  // Update video progress
  updateVideoProgress: async (progressData: {
    courseId: string;
    videoUrl: string;
    currentTime: number;
    totalDuration: number;
    chapterId?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post('/video-progress', progressData);
    return response.data;
  },

  // Get video progress for a specific video
  getVideoProgress: async (courseId: string, videoUrl: string): Promise<ApiResponse<any>> => {
    const encodedVideoUrl = encodeURIComponent(videoUrl);
    const response = await api.get(`/video-progress/${courseId}/${encodedVideoUrl}`);
    return response.data;
  },

  // Get all video progress for a course
  getCourseVideoProgress: async (courseId: string): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/video-progress/course/${courseId}`);
    return response.data;
  },

  // Get all video progress for the user
  getUserVideoProgress: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/video-progress/my-progress');
    return response.data;
  },

  // Get video progress statistics
  getVideoProgressStats: async (): Promise<ApiResponse<{
    totalVideos: number;
    completedVideos: number;
    inProgressVideos: number;
    totalWatchTime: number;
    averageProgress: number;
  }>> => {
    const response = await api.get('/video-progress/stats');
    return response.data;
  },

  // Get recently watched videos for "Continue Watching"
  getRecentlyWatchedVideos: async (limit: number = 5): Promise<ApiResponse<any[]>> => {
    const response = await api.get(`/video-progress/continue-watching?limit=${limit}`);
    return response.data;
  },
};

export default api;
