import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../services/api';

interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  updateLoading: boolean;
  updateError: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  updateLoading: false,
  updateError: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Fetch profile actions
    fetchUserProfileStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchUserProfileSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.profile = action.payload;
      state.error = null;
    },
    fetchUserProfileFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Update profile actions
    updateUserProfileStart: (state) => {
      state.updateLoading = true;
      state.updateError = null;
    },
    updateUserProfileSuccess: (state, action: PayloadAction<User>) => {
      state.updateLoading = false;
      state.profile = action.payload;
      state.updateError = null;
    },
    updateUserProfileFailure: (state, action: PayloadAction<string>) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },

    // Clear errors
    clearUserError: (state) => {
      state.error = null;
      state.updateError = null;
    },

    // Clear user data
    clearUserData: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
      state.updateLoading = false;
      state.updateError = null;
    },
  },
});

export const {
  fetchUserProfileStart,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  updateUserProfileStart,
  updateUserProfileSuccess,
  updateUserProfileFailure,
  clearUserError,
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
