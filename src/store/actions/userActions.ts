import { Dispatch } from '@reduxjs/toolkit';
import { userAPI, User } from '../../services/api';
import {
  fetchUserProfileStart,
  fetchUserProfileSuccess,
  fetchUserProfileFailure,
  updateUserProfileStart,
  updateUserProfileSuccess,
  updateUserProfileFailure,
  clearUserError as clearUserErrorAction, // Rename the import to avoid naming conflict
} from '../slices/userSlice';

// Fetch user profile
export const fetchUserProfile = () => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(fetchUserProfileStart());

      const response = await userAPI.getProfile();

      if (response.success && response.data) {
        dispatch(fetchUserProfileSuccess(response.data));
      } else {
        dispatch(fetchUserProfileFailure(response.error?.message || 'Failed to fetch profile'));
      }
    } catch (error: any) {
      console.error('Fetch user profile error:', error);
      
      let errorMessage = 'Failed to fetch profile. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(fetchUserProfileFailure(errorMessage));
    }
  };
};

// Update user profile
export const updateUserProfile = (userData: Partial<User>) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(updateUserProfileStart());

      const response = await userAPI.updateProfile(userData);

      if (response.success && response.data) {
        dispatch(updateUserProfileSuccess(response.data));
      } else {
        dispatch(updateUserProfileFailure(response.error?.message || 'Failed to update profile'));
      }
    } catch (error: any) {
      console.error('Update user profile error:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(updateUserProfileFailure(errorMessage));
    }
  };
};

// Remove the clearUserError function entirely and just export the slice action
export { clearUserError } from '../slices/userSlice';
