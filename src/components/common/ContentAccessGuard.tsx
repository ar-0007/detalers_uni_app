import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSubscription, useContentAccess } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';
import SubscriptionStatus from './SubscriptionStatus';

interface ContentAccessGuardProps {
  contentType: 'course' | 'chapter';
  contentId: string;
  courseId?: string;
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  onAccessDenied?: (reason: string, suggestedAction?: string) => void;
  showSubscriptionStatus?: boolean;
}

const ContentAccessGuard: React.FC<ContentAccessGuardProps> = ({
  contentType,
  contentId,
  courseId,
  children,
  fallbackComponent,
  onAccessDenied,
  showSubscriptionStatus = true,
}) => {
  const { theme } = useTheme();
  const { validateNavigation, checkCourseAccess, checkChapterAccess } = useSubscription();
  const [accessResult, setAccessResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [navigationResult, setNavigationResult] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      setIsChecking(true);
      
      try {
        // Check content access
        const contentAccess = contentType === 'course' 
          ? await checkCourseAccess(contentId)
          : await checkChapterAccess(contentId, courseId);
        setAccessResult(contentAccess);
        
        // Check navigation permissions
        const navResult = await validateNavigation(contentType, contentId, courseId);
        setNavigationResult(navResult);
        
        if (!navResult.canNavigate && onAccessDenied) {
          onAccessDenied(navResult.reason || 'Access denied', navResult.suggestedAction);
        }
      } catch (error) {
        console.error('Error checking content access:', error);
        setNavigationResult({ canNavigate: false, reason: 'Error checking access' });
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [contentType, contentId, courseId, checkCourseAccess, checkChapterAccess, validateNavigation, onAccessDenied]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    accessDeniedContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    lockIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.error + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    lockIconText: {
      fontSize: 32,
      color: theme.colors.error,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 24,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 12,
    },
    actionButtonText: {
      color: theme.colors.background,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    secondaryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    secondaryButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
      textAlign: 'center',
    },
  });

  // Show loading state while checking access
  if (isChecking || !navigationResult) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>
          Checking access permissions...
        </Text>
      </View>
    );
  }

  // Show content if access is granted
  if (navigationResult.canNavigate && accessResult?.hasAccess) {
    return <View style={styles.container}>{children}</View>;
  }

  // Show custom fallback component if provided
  if (fallbackComponent) {
    return <View style={styles.container}>{fallbackComponent}</View>;
  }

  // Default access denied UI
  const getActionButtonText = () => {
    switch (navigationResult.suggestedAction) {
      case 'login':
        return 'Log In';
      case 'subscribe':
        return 'Get Subscription';
      case 'enroll':
        return 'Enroll in Course';
      case 'purchase':
        return 'Purchase Course';
      default:
        return 'Get Access';
    }
  };

  const getTitle = () => {
    switch (navigationResult.suggestedAction) {
      case 'login':
        return 'Login Required';
      case 'subscribe':
        return 'Premium Content';
      case 'enroll':
        return 'Enrollment Required';
      case 'purchase':
        return 'Purchase Required';
      default:
        return 'Access Restricted';
    }
  };

  const getMessage = () => {
    if (navigationResult.reason) {
      return navigationResult.reason;
    }
    
    switch (navigationResult.suggestedAction) {
      case 'login':
        return 'Please log in to your account to access this content.';
      case 'subscribe':
        return 'This is premium content. Subscribe to unlock all courses and chapters.';
      case 'enroll':
        return 'You need to enroll in this course to access its content.';
      case 'purchase':
        return 'Purchase this course to access its content.';
      default:
        return 'You do not have permission to access this content.';
    }
  };

  return (
    <View style={styles.accessDeniedContainer}>
      <View style={styles.lockIcon}>
        <Text style={styles.lockIconText}>🔒</Text>
      </View>
      
      <Text style={styles.title}>{getTitle()}</Text>
      <Text style={styles.message}>{getMessage()}</Text>
      
      {showSubscriptionStatus && (
        <SubscriptionStatus 
          style={{ marginBottom: 20, width: '100%' }}
          onUpgradePress={() => {
            // Handle upgrade action
            console.log('Upgrade pressed');
          }}
        />
      )}
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => {
          // Handle action based on suggested action
          console.log('Action pressed:', navigationResult.suggestedAction);
        }}
      >
        <Text style={styles.actionButtonText}>
          {getActionButtonText()}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          Learn More
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContentAccessGuard;