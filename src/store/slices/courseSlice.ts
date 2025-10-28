import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, Category, VideoSeries } from '../../services/api';

interface CourseState {
  courses: Course[];
  categories: Category[];
  videoSeries: VideoSeries[];
  isLoading: boolean;
  error: string | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  videoSeriesLoading: boolean;
  videoSeriesError: string | null;
}

const initialState: CourseState = {
  courses: [],
  categories: [],
  videoSeries: [],
  isLoading: false,
  error: null,
  categoriesLoading: false,
  categoriesError: null,
  videoSeriesLoading: false,
  videoSeriesError: null,
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

    // Clear errors
    clearCourseError: (state) => {
      state.error = null;
      state.categoriesError = null;
      state.videoSeriesError = null;
    },

    // Clear all course data
    clearCourseData: (state) => {
      state.courses = [];
      state.categories = [];
      state.videoSeries = [];
      state.isLoading = false;
      state.error = null;
      state.categoriesLoading = false;
      state.categoriesError = null;
      state.videoSeriesLoading = false;
      state.videoSeriesError = null;
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
  clearCourseError,
  clearCourseData,
} = courseSlice.actions;

export default courseSlice.reducer;
