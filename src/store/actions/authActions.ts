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
import { clearSubscriptionData } from '../slices/subscriptionSlice';
import { fetchUserSubscription } from './subscriptionActions';

// Login action
export const loginUser = (email: string, password: string) => {
  return async (dispatch: Dispatch) => {
    try {
      dispatch(loginStart());

      // Call the API
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        const { user, token } = response.data;

        // Store token and user data
        await tokenStorage.setToken(token);
        await userStorage.setUserData(user);

        // Map API user properties to authSlice User interface
        const mappedUser = {
          id: user.user_id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          isActive: user.is_active,
        };

        // Dispatch success action
        dispatch(loginSuccess({ user: mappedUser, token }));
        
        // Fetch user subscription data after successful login
        dispatch(fetchUserSubscription() as any);
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

    // Clear subscription data
    dispatch(clearSubscriptionData());

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
        // Map stored user data to authSlice User interface
        const mappedUser = {
          id: userData.user_id || userData.id,
          email: userData.email,
          firstName: userData.first_name || userData.firstName,
          lastName: userData.last_name || userData.lastName,
          role: userData.role,
          isActive: userData.is_active !== undefined ? userData.is_active : userData.isActive,
        };

        // User has valid stored data
        dispatch(loginSuccess({ user: mappedUser, token }));
        
        // Fetch user subscription data after restoring session
        dispatch(fetchUserSubscription() as any);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Clear invalid data
      await tokenStorage.removeToken();
      await userStorage.removeUserData();
    }
  };
};
