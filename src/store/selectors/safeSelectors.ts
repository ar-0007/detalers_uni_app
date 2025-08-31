import { RootState } from '../index';
import { safeArrayAccess, safeLength, safeGet, safeObjectAccess, isValidArray, isValidObject } from '../../utils/safeAccess';
import GlobalErrorHandler, { globalErrorHandler } from '../../utils/globalErrorHandler';

// Enhanced safe course selectors with comprehensive error handling
export const selectCourses = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => {
      const courses = safeGet(state, 'course.courses', []);
      return isValidArray(courses) ? courses : [];
    },
    [],
    'selectCourses'
  );
};

export const selectCoursesLength = (state: RootState) => {
  return safeLength(state.course?.courses);
};

export const selectCategories = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => {
      const categories = safeGet(state, 'course.categories', []);
      return isValidArray(categories) ? categories : [];
    },
    [],
    'selectCategories'
  );
};

export const selectCategoriesLength = (state: RootState) => {
  return safeLength(state.course?.categories);
};

export const selectVideoSeries = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => {
      const videoSeries = safeGet(state, 'course.videoSeries', []);
      return isValidArray(videoSeries) ? videoSeries : [];
    },
    [],
    'selectVideoSeries'
  );
};

export const selectVideoSeriesLength = (state: RootState) => {
  return safeLength(state.course?.videoSeries);
};

export const selectPodcasts = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => {
      const podcasts = safeGet(state, 'course.podcasts', []);
      return isValidArray(podcasts) ? podcasts : [];
    },
    [],
    'selectPodcasts'
  );
};

export const selectPodcastsLength = (state: RootState) => {
  return safeLength(state.course?.podcasts);
};

// Safe course loading states
export const selectCoursesLoading = (state: RootState) => {
  return state.course?.isLoading ?? false;
};

export const selectCoursesError = (state: RootState) => {
  return state.course?.error ?? null;
};

// Enhanced safe auth selectors
export const selectIsAuthenticated = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => safeGet(state, 'auth.isAuthenticated', false),
    false,
    'selectIsAuthenticated'
  );
};

export const selectCurrentUser = (state: RootState) => {
  return GlobalErrorHandler.withErrorBoundary(
    () => {
      const user = safeGet(state, 'auth.user', null);
      return isValidObject(user) ? user : null;
    },
    null,
    'selectCurrentUser'
  );
};

export const selectAuthLoading = (state: RootState) => {
  return state.auth?.isLoading ?? false;
};

// Safe user selectors
export const selectUserProfile = (state: RootState) => {
  return state.user?.profile ?? null;
};

export const selectUserLoading = (state: RootState) => {
  return state.user?.isLoading ?? false;
};

// Safe theme selectors
export const selectTheme = (state: RootState) => {
  return state.theme ?? { isDarkMode: false, theme: null };
};

export const selectIsDarkTheme = (state: RootState) => {
  return state.theme?.isDarkMode ?? false;
};

// Helper function to safely access course by ID
export const selectCourseById = (courseId: string) => (state: RootState) => {
  const courses = selectCourses(state);
  return courses.find((course: any) => course?.course_id === courseId) ?? null;
};

// Helper function to safely get courses by category
export const selectCoursesByCategory = (categoryId: string) => (state: RootState) => {
  const courses = selectCourses(state);
  return courses.filter((course: any) => course?.category_id === categoryId);
};

// Helper function to safely get published courses
export const selectPublishedCourses = (state: RootState) => {
  const courses = selectCourses(state);
  return courses.filter((course: any) => course?.is_published === true);
};

// Helper function to safely get courses by series
export const selectCoursesBySeries = (seriesName: string) => (state: RootState) => {
  const courses = selectCourses(state);
  return courses.filter((course: any) => course?.video_series === seriesName);
};

// Helper function to safely access podcast by ID
export const selectPodcastById = (podcastId: string) => (state: RootState) => {
  const podcasts = selectPodcasts(state);
  return podcasts.find((podcast: any) => podcast?.podcast_id === podcastId) ?? null;
};

// Helper function to safely access video series by ID
export const selectVideoSeriesById = (seriesId: string) => (state: RootState) => {
  const videoSeries = selectVideoSeries(state);
  return videoSeries.find((series: any) => series?.series_id === seriesId) ?? null;
};

// Helper function to safely access category by ID
export const selectCategoryById = (categoryId: string) => (state: RootState) => {
  const categories = selectCategories(state);
  return categories.find((category: any) => category?.category_id === categoryId) ?? null;
};

// Helper function to safely get published podcasts
export const selectPublishedPodcasts = (state: RootState) => {
  const podcasts = selectPodcasts(state);
  return podcasts.filter((podcast: any) => podcast?.status === 'published');
};

// Generic safe array selector factory
export const createSafeArraySelector = <T>(selector: (state: RootState) => T[] | null | undefined) => {
  return (state: RootState) => {
    const result = selector(state);
    return isValidArray(result) ? result : [];
  };
};

// Generic safe length selector factory
export const createSafeLengthSelector = <T>(selector: (state: RootState) => T[] | null | undefined) => {
  return (state: RootState) => safeLength(selector(state));
};

// Safe selectors for nested data with error handling
export const selectSafeData = <T>(data: T | null | undefined, fallback: T): T => {
  try {
    return data ?? fallback;
  } catch (error) {
    console.warn('[SafeSelectors] Error accessing data:', error);
    return fallback;
  }
};

// Safe selector for array data with error handling
export const selectSafeArrayData = <T>(data: T[] | null | undefined): T[] => {
  try {
    return isValidArray(data) ? data : [];
  } catch (error) {
    console.warn('[SafeSelectors] Error accessing array data:', error);
    return [];
  }
};

// Safe selector for object properties
export const selectSafeProperty = <T, K extends keyof T>(obj: T | null | undefined, key: K, fallback: T[K]): T[K] => {
  try {
    return obj?.[key] ?? fallback;
  } catch (error) {
    console.warn(`[SafeSelectors] Error accessing property ${String(key)}:`, error);
    return fallback;
  }
};

// Additional safe loading state selectors
export const selectCategoriesLoading = (state: RootState) => {
  return state.course?.categoriesLoading ?? false;
};

export const selectVideoSeriesLoading = (state: RootState) => {
  return state.course?.videoSeriesLoading ?? false;
};

export const selectPodcastsLoading = (state: RootState) => {
  return state.course?.podcastsLoading ?? false;
};