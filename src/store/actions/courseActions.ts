import { Dispatch } from 'redux';
import { courseAPI, podcastAPI, Course, Category, VideoSeries, Podcast } from '../../services/api';
import {
  fetchCoursesStart,
  fetchCoursesSuccess,
  fetchCoursesFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchVideoSeriesStart,
  fetchVideoSeriesSuccess,
  fetchVideoSeriesFailure,
  clearCourseError,
  fetchPodcastsStart,
  fetchPodcastsSuccess,
  fetchPodcastsFailure,
} from '../slices/courseSlice';

// Fetch all courses
export const fetchCourses = (isPublished?: boolean) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchCoursesStart());

      const response = await courseAPI.getAllCourses(isPublished);

      if (response.success) {
        dispatch(fetchCoursesSuccess(response.data || []));
      } else {
        dispatch(fetchCoursesFailure(response.error?.message || 'Failed to fetch courses'));
      }
    } catch (error: any) {
      console.error('Fetch courses error:', error);
      
      let errorMessage = 'Failed to fetch courses. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(fetchCoursesFailure(errorMessage));
    }
  };
};

// Fetch course by ID
export const fetchCourseById = (courseId: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchCoursesStart());

      const response = await courseAPI.getCourseById(courseId);

      if (response.success && response.data) {
        dispatch(fetchCoursesSuccess([response.data]));
      } else {
        dispatch(fetchCoursesFailure(response.error?.message || 'Failed to fetch course'));
      }
    } catch (error: any) {
      console.error('Fetch course error:', error);
      
      let errorMessage = 'Failed to fetch course. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(fetchCoursesFailure(errorMessage));
    }
  };
};

// Fetch categories
export const fetchCategories = () => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchCategoriesStart());

      const response = await courseAPI.getCategories();

      if (response.success) {
        dispatch(fetchCategoriesSuccess(response.data || []));
      } else {
        dispatch(fetchCategoriesFailure(response.error?.message || 'Failed to fetch categories'));
      }
    } catch (error: any) {
      console.error('Fetch categories error:', error);
      
      let errorMessage = 'Failed to fetch categories. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(fetchCategoriesFailure(errorMessage));
    }
  };
};

// Fetch video series (for podcasts)
export const fetchVideoSeries = () => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchPodcastsStart());

      const response = await courseAPI.getVideoSeries();

      if (response.success) {
        dispatch(fetchPodcastsSuccess(response.data || []));
      } else {
        dispatch(fetchPodcastsFailure(response.error?.message || 'Failed to fetch video series'));
      }
    } catch (error: any) {
      console.error('Fetch video series error:', error);
      
      let errorMessage = 'Failed to fetch video series. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(fetchPodcastsFailure(errorMessage));
    }
  };
};

// Fetch podcasts
export const fetchPodcasts = () => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchPodcastsStart());
      
      const response = await podcastAPI.getPodcasts();
      
      if (response.success) {
        dispatch(fetchPodcastsSuccess(response.data || []));
      } else {
        dispatch(fetchPodcastsFailure(response.error?.message || 'Failed to fetch podcasts'));
      }
    } catch (error: any) {
      console.error('Fetch podcasts error:', error);
      
      let errorMessage = 'Failed to fetch podcasts. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to view podcasts.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to view podcasts.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      dispatch(fetchPodcastsFailure(errorMessage));
    }
  };
};

// Clear course error
export const clearCourseErrors = () => {
  return (dispatch: Dispatch) => {
    dispatch(clearCourseError());
  };
};
