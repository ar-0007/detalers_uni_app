import { Dispatch } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { tokenStorage, userStorage } from '../../utils/storage';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} from '../slices/authSlice';

// Login action
export const loginUser = (email: string, password: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(loginStart());

      // Call the API
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Transform user data from API format to auth slice format
        const transformedUser = {
          id: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
          isFirstLogin: false // Default value since it's not in the API User interface
        };

        // Store token and user data
        await tokenStorage.setToken(token);
        await userStorage.setUserData(user);

        // Dispatch success action with transformed user
        dispatch(loginSuccess({ user: transformedUser, token }));
      } else {
        dispatch(loginFailure(response.error?.message || 'Login failed'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error: Please check your connection and ensure the backend server is running.';
        console.error('Network error details:', {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          message: error.message
        });
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      dispatch(loginFailure(errorMessage));
    }
  };
};

// Logout action
export const logoutUser = () => {
  return async (dispatch: Dispatch) => {
    try {
      // Call logout API (optional - for server-side logout)
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    }

    // Clear stored data
    await tokenStorage.removeToken();
    await userStorage.removeUserData();

    // Dispatch logout action
    dispatch(logout());
  };
};

// Clear error action
export const clearAuthError = () => {
  return (dispatch: Dispatch) => {
    dispatch(clearError());
  };
};

// Check if user is already logged in (on app start)
export const checkAuthStatus = () => {
  return async (dispatch: Dispatch) => {
    try {
      const token = await tokenStorage.getToken();
      const userData = await userStorage.getUserData();

      if (token && userData) {
        // Transform user data from API format to auth slice format
        const transformedUser = {
          id: userData.user_id,
          email: userData.email,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          isActive: userData.is_active,
          isFirstLogin: false // Default value since it's not in the API User interface
        };

        // User has valid stored data
        dispatch(loginSuccess({ user: transformedUser, token }));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      await tokenStorage.removeToken();
      await userStorage.removeUserData();
    }
  };
};
