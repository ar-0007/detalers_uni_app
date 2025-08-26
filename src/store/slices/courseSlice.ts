import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Category, VideoSeries, Podcast } from '../../services/api';

interface CourseState {
  courses: Course[];
  categories: Category[];
  videoSeries: VideoSeries[];
  podcasts: Podcast[]; // Add podcasts
  isLoading: boolean;
  error: string | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  videoSeriesLoading: boolean;
  videoSeriesError: string | null;
  podcastsLoading: boolean; // Add podcast loading state
  podcastsError: string | null; // Add podcast error state
}

const initialState: CourseState = {
  courses: [],
  categories: [],
  videoSeries: [],
  podcasts: [], // Initialize podcasts
  isLoading: false,
  error: null,
  categoriesLoading: false,
  categoriesError: null,
  videoSeriesLoading: false,
  videoSeriesError: null,
  podcastsLoading: false, // Initialize podcast loading
  podcastsError: null, // Initialize podcast error
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    // Course actions
    fetchCoursesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchCoursesSuccess: (state, action: PayloadAction<Course[]>) => {
      state.isLoading = false;
      state.courses = action.payload;
      state.error = null;
    },
    fetchCoursesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Category actions
    fetchCategoriesStart: (state) => {
      state.categoriesLoading = true;
      state.categoriesError = null;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<Category[]>) => {
      state.categoriesLoading = false;
      state.categories = action.payload;
      state.categoriesError = null;
    },
    fetchCategoriesFailure: (state, action: PayloadAction<string>) => {
      state.categoriesLoading = false;
      state.categoriesError = action.payload;
    },

    // Video series actions
    fetchVideoSeriesStart: (state) => {
      state.videoSeriesLoading = true;
      state.videoSeriesError = null;
    },
    fetchVideoSeriesSuccess: (state, action: PayloadAction<VideoSeries[]>) => {
      state.videoSeriesLoading = false;
      state.videoSeries = action.payload;
      state.videoSeriesError = null;
    },
    fetchVideoSeriesFailure: (state, action: PayloadAction<string>) => {
      state.videoSeriesLoading = false;
      state.videoSeriesError = action.payload;
    },

    // Podcast actions
    fetchPodcastsStart: (state) => {
      state.podcastsLoading = true;
      state.podcastsError = null;
    },
    fetchPodcastsSuccess: (state, action: PayloadAction<Podcast[]>) => {
      state.podcastsLoading = false;
      state.podcasts = action.payload;
      state.podcastsError = null;
    },
    fetchPodcastsFailure: (state, action: PayloadAction<string>) => {
      state.podcastsLoading = false;
      state.podcastsError = action.payload;
    },

    // Clear errors
    clearCourseError: (state) => {
      state.error = null;
      state.categoriesError = null;
      state.videoSeriesError = null;
      state.podcastsError = null;
    },

    // Clear all course data
    clearCourseData: (state) => {
      state.courses = [];
      state.categories = [];
      state.videoSeries = [];
      state.podcasts = [];
      state.isLoading = false;
      state.error = null;
      state.categoriesLoading = false;
      state.categoriesError = null;
      state.videoSeriesLoading = false;
      state.videoSeriesError = null;
      state.podcastsLoading = false;
      state.podcastsError = null;
    },
  },
});

export const {
  fetchCoursesStart,
  fetchCoursesSuccess,
  fetchCoursesFailure,
  fetchCategoriesStart,
  fetchCategoriesSuccess,
  fetchCategoriesFailure,
  fetchVideoSeriesStart,
  fetchVideoSeriesSuccess,
  fetchVideoSeriesFailure,
  fetchPodcastsStart,
  fetchPodcastsSuccess,
  fetchPodcastsFailure,
  clearCourseError,
  clearCourseData,
} = courseSlice.actions;

export default courseSlice.reducer;
