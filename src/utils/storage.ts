import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
};

// Fallback in-memory storage for development/testing
const fallbackStorage = new Map<string, string>();

// Helper function to safely use AsyncStorage with fallback
const safeAsyncStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage failed, using fallback storage:', error);
      fallbackStorage.set(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage failed, using fallback storage:', error);
      return fallbackStorage.get(key) || null;
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage failed, using fallback storage:', error);
      fallbackStorage.delete(key);
    }
  }
};

// Token management
export const tokenStorage = {
  // Store authentication token
  setToken: async (token: string): Promise<void> => {
    try {
      await safeAsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Error storing token:', error);
    }
  },

  // Get authentication token
  getToken: async (): Promise<string | null> => {
    try {
      return await safeAsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Remove authentication token
  removeToken: async (): Promise<void> => {
    try {
      await safeAsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Store refresh token
  setRefreshToken: async (token: string): Promise<void> => {
    try {
      await safeAsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
    }
  },

  // Get refresh token
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await safeAsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Remove refresh token
  removeRefreshToken: async (): Promise<void> => {
    try {
      await safeAsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  },
};

// User data management
export const userStorage = {
  // Store user data
  setUserData: async (userData: any): Promise<void> => {
    try {
      await safeAsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  },

  // Get user data
  getUserData: async (): Promise<any | null> => {
    try {
      const userData = await safeAsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  // Remove user data
  removeUserData: async (): Promise<void> => {
    try {
      await safeAsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },
};

// Clear all auth-related data
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([
      tokenStorage.removeToken(),
      tokenStorage.removeRefreshToken(),
      userStorage.removeUserData(),
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Export as default for backward compatibility
export default {
  tokenStorage,
  userStorage,
  clearAuthData,
};
