import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    auth: authReducer,
    course: courseReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 