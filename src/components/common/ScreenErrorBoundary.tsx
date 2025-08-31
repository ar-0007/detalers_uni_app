import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { connect } from 'react-redux';
import { RootState } from '../../store';
import {
  ErrorBoundaryState,
  ErrorBoundaryProps,
  ErrorFallbackProps,
  logError,
  getUserFriendlyErrorMessage,
  getErrorSeverity,
  ErrorSeverity,
} from '../../utils/errorReporting';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AccessibilityHelper } from '../../utils/accessibility';

// Screen-specific Error Fallback Component
class ScreenErrorFallback extends Component<ErrorFallbackProps & { theme: any; screenName?: string }> {
  override render() {
    const { error, resetError, errorId, theme, screenName = 'Screen' } = this.props;
    const userMessage = error ? getUserFriendlyErrorMessage(error) : 'Something went wrong on this screen';
    const severity = error ? getErrorSeverity(error) : ErrorSeverity.MEDIUM;
    
    const getSeverityColor = () => {
      switch (severity) {
        case ErrorSeverity.CRITICAL:
          return theme.colors.error;
        case ErrorSeverity.HIGH:
          return '#FF8C42';
        case ErrorSeverity.MEDIUM:
          return theme.colors.warning;
        default:
          return theme.colors.info;
      }
    };

    const getSeverityIcon = () => {
      switch (severity) {
        case ErrorSeverity.CRITICAL:
          return 'error';
        case ErrorSeverity.HIGH:
          return 'warning';
        case ErrorSeverity.MEDIUM:
          return 'info';
        default:
          return 'help-outline';
      }
    };

    return (
      <SafeAreaView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        accessibilityRole="alert"
        accessibilityLabel={`${screenName} error: ${userMessage}`}
        accessibilityLiveRegion="assertive"
      >
        <View style={styles.content}>
          {/* Error Icon */}
          <View 
            style={[styles.iconContainer, { backgroundColor: `${getSeverityColor()}20` }]}
            {...AccessibilityHelper.hide()}
          >
            <Icon 
              name={getSeverityIcon()} 
              size={48} 
              color={getSeverityColor()}
              {...AccessibilityHelper.hide()}
            />
          </View>

          {/* Error Message */}
          <Text 
            style={[styles.title, { color: theme.colors.text }]}
            accessibilityRole="header"
          >
            {screenName} Error
          </Text>
          
          <Text 
            style={[styles.message, { color: theme.colors.textSecondary }]}
            accessibilityRole="text"
            accessibilityLabel={`Error description: ${userMessage}`}
          >
            {userMessage}
          </Text>

          {/* Error ID (if available) */}
          {errorId && (
            <Text 
              style={[styles.errorId, { color: theme.colors.textTertiary }]}
              accessibilityRole="text"
              accessibilityLabel={`Error ID: ${errorId}`}
            >
              Error ID: {errorId}
            </Text>
          )}

          {/* Actions */}
          <View 
            style={styles.actionsContainer}
            accessibilityLabel="Error recovery actions"
          >
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: theme.colors.primary, ...theme.shadows.small }
              ]}
              onPress={resetError}
              activeOpacity={0.8}
              {...AccessibilityHelper.button({
                label: 'Try Again',
                hint: `Retry loading the ${screenName} screen`,
                disabled: false,
                selected: false
              })}
              testID={`screen-error-retry-${screenName?.toLowerCase()}`}
            >
              <Icon 
                name="refresh" 
                size={20} 
                color="#FFFFFF" 
                style={styles.buttonIcon}
                {...AccessibilityHelper.hide()}
              />
              <Text 
                style={[styles.primaryButtonText, { color: '#FFFFFF' }]}
                {...AccessibilityHelper.hide()}
              >
                Try Again
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { borderColor: theme.colors.border }
              ]}
              onPress={() => {
                // In a real app, this could navigate back or to a safe screen
                console.log('Go back pressed for screen error:', screenName);
              }}
              activeOpacity={0.8}
              {...AccessibilityHelper.button({
                label: 'Go Back',
                hint: 'Navigate back to the previous screen',
                disabled: false,
                selected: false
              })}
              testID={`screen-error-back-${screenName?.toLowerCase()}`}
            >
              <Icon 
                name="arrow-back" 
                size={20} 
                color={theme.colors.primary} 
                style={styles.buttonIcon}
                {...AccessibilityHelper.hide()}
              />
              <Text 
                style={[styles.secondaryButtonText, { color: theme.colors.primary }]}
                {...AccessibilityHelper.hide()}
              >
                Go Back
              </Text>
            </TouchableOpacity>
          </View>

          {/* Development Info */}
          {__DEV__ && error && (
            <View 
              style={[styles.devInfo, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              accessibilityLabel="Development debugging information"
            >
              <Text 
                style={[styles.devTitle, { color: theme.colors.error }]}
                accessibilityRole="header"
              >
                Dev Info
              </Text>
              <Text 
                style={[styles.devText, { color: theme.colors.textSecondary }]} 
                numberOfLines={3}
                accessibilityRole="text"
                accessibilityLabel={`Error details: ${error.message}`}
              >
                {error.message}
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }
}

// Screen Error Boundary Component
interface ScreenErrorBoundaryProps extends ErrorBoundaryProps {
  screenName?: string;
  theme: any;
}

class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ScreenErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { screenName = 'UnknownScreen' } = this.props;
    
    // Log the error with screen context
    const errorId = logError(error, errorInfo, {
      errorBoundary: 'ScreenErrorBoundary',
      screenName,
    });

    // Update state with error info and ID
    this.setState({
      errorInfo,
      errorId,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  override componentDidUpdate(prevProps: ScreenErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => prevProps.resetKeys?.[index] !== key
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
    });
  };

  override render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback: Fallback, theme, screenName } = this.props;

    if (hasError) {
      if (Fallback) {
        const fallbackProps: any = {
          resetError: this.resetErrorBoundary,
        };
        if (error) fallbackProps.error = error;
        if (errorInfo) fallbackProps.errorInfo = errorInfo;
        if (errorId) fallbackProps.errorId = errorId;
        
        return (
          <Fallback
            {...fallbackProps}
          />
        );
      }

      const screenErrorProps: any = {
        resetError: this.resetErrorBoundary,
        theme,
        screenName,
      };
      if (error) screenErrorProps.error = error;
      if (errorInfo) screenErrorProps.errorInfo = errorInfo;
      if (errorId) screenErrorProps.errorId = errorId;

      return (
        <ScreenErrorFallback
          {...screenErrorProps}
        />
      );
    }

    return children;
  }
}

// Connect to Redux for theme
const mapStateToProps = (state: RootState) => ({
  theme: state.theme.theme,
});

const ConnectedScreenErrorBoundary = connect(mapStateToProps)(ScreenErrorBoundary);

// Export both connected and unconnected versions
export { ScreenErrorBoundary as UnconnectedScreenErrorBoundary };
export default ConnectedScreenErrorBoundary;

// Higher-order component for easy screen wrapping
export const withScreenErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName?: string
) => {
  const WithScreenErrorBoundaryComponent = (props: P) => {
    const boundaryProps: any = {};
    if (screenName) boundaryProps.screenName = screenName;
    
    return (
      <ConnectedScreenErrorBoundary {...boundaryProps}>
        <WrappedComponent {...props} />
      </ConnectedScreenErrorBoundary>
    );
  };

  WithScreenErrorBoundaryComponent.displayName = `withScreenErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithScreenErrorBoundaryComponent;
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorId: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 32,
  },
  actionsContainer: {
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  devInfo: {
    marginTop: 24,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    maxWidth: 280,
  },
  devTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  devText: {
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});