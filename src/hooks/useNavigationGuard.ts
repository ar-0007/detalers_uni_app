import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSubscription, useContentAccess } from '../contexts/SubscriptionContext';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Alert } from 'react-native';
import { RootStackParamList } from '../navigation/types';

interface NavigationGuardOptions {
  requireAuth?: boolean;
  requireSubscription?: boolean;
  contentType?: 'course' | 'chapter';
  contentId?: string;
  courseId?: string;
  fallbackRoute?: string;
  showAlert?: boolean;
}

export const useNavigationGuard = () => {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { hasActiveSubscription, subscriptionStatus } = useSubscription();
  const { validateNavigation } = useSubscription();

  const guardedNavigate = useCallback(async (
    routeName: string,
    params?: any,
    options: NavigationGuardOptions = {}
  ) => {
    const {
      requireAuth = false,
      requireSubscription = false,
      contentType,
      contentId,
      courseId,
      fallbackRoute = 'Login',
      showAlert = true
    } = options;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      if (showAlert) {
        Alert.alert(
          'Authentication Required',
          'Please log in to access this content.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Log In', 
              onPress: () => navigation.navigate(fallbackRoute as never)
            }
          ]
        );
      } else {
        navigation.navigate(fallbackRoute as never);
      }
      return false;
    }

    // Check subscription requirement
    if (requireSubscription && !hasActiveSubscription) {
      if (showAlert) {
        Alert.alert(
          'Subscription Required',
          'This content requires an active subscription. Would you like to subscribe?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Subscribe', 
              onPress: () => {
                // Navigate to subscription/upgrade screen
                // This would be implemented based on your subscription flow
                console.log('Navigate to subscription screen');
              }
            }
          ]
        );
      }
      return false;
    }

    // Check content-specific access if provided
    if (contentType && contentId) {
      const accessResult = await validateNavigation(contentType, contentId, courseId);
      
      if (!accessResult.canNavigate) {
        if (showAlert) {
          const getAlertConfig = () => {
            switch (accessResult.suggestedAction) {
              case 'login':
                return {
                  title: 'Login Required',
                  message: 'Please log in to access this content.',
                  actionText: 'Log In',
                  actionRoute: 'Login'
                };
              case 'subscribe':
                return {
                  title: 'Subscription Required',
                  message: 'This is premium content. Subscribe to unlock all courses.',
                  actionText: 'Subscribe',
                  actionRoute: null // Handle subscription flow
                };
              case 'enroll':
                return {
                  title: 'Enrollment Required',
                  message: 'You need to enroll in this course first.',
                  actionText: 'Enroll',
                  actionRoute: null // Handle enrollment flow
                };
              case 'purchase':
                return {
                  title: 'Purchase Required',
                  message: 'Purchase this course to access its content.',
                  actionText: 'Purchase',
                  actionRoute: null // Handle purchase flow
                };
              default:
                return {
                  title: 'Access Denied',
                  message: accessResult.reason || 'You do not have permission to access this content.',
                  actionText: 'OK',
                  actionRoute: null
                };
            }
          };

          const alertConfig = getAlertConfig();
          
          Alert.alert(
            alertConfig.title,
            alertConfig.message,
            [
              { text: 'Cancel', style: 'cancel' },
              ...(alertConfig.actionRoute ? [{
                text: alertConfig.actionText,
                onPress: () => navigation.navigate(alertConfig.actionRoute as never)
              }] : [{
                text: alertConfig.actionText,
                style: 'default' as const
              }])
            ]
          );
        }
        return false;
      }
    }

    // All checks passed, proceed with navigation
    navigation.navigate(routeName, params);
    return true;
  }, [
    navigation,
    isAuthenticated,
    hasActiveSubscription,
    subscriptionStatus,
    validateNavigation
  ]);

  const canNavigate = useCallback(async (
    options: NavigationGuardOptions = {}
  ): Promise<boolean> => {
    const {
      requireAuth = false,
      requireSubscription = false,
      contentType,
      contentId,
      courseId
    } = options;

    // Check authentication
    if (requireAuth && !isAuthenticated) {
      return false;
    }

    // Check subscription
    if (requireSubscription && !hasActiveSubscription) {
      return false;
    }

    // Check content access
    if (contentType && contentId) {
      const accessResult = await validateNavigation(contentType, contentId, courseId);
      return accessResult.canNavigate;
    }

    return true;
  }, [
    isAuthenticated,
    hasActiveSubscription,
    validateNavigation
  ]);

  return {
    guardedNavigate,
    canNavigate,
    isAuthenticated,
    hasActiveSubscription,
    subscriptionStatus
  };
};

export default useNavigationGuard;