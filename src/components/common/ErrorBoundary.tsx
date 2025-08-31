import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { globalErrorHandler } from '../../utils/globalErrorHandler';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | undefined;
  onError?: ((error: Error, errorInfo: any) => void) | undefined;
  context?: string | undefined;
  showErrorDetails?: boolean | undefined;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    const context = this.props.context || 'ErrorBoundary';
    
    // Log error details
    console.error(`Error caught by ErrorBoundary (${context}):`, error);
    console.error('Error info:', errorInfo);
    
    // Report to global error handler
    globalErrorHandler.reportError(error, {
      context,
      componentStack: errorInfo.componentStack,
      source: 'ErrorBoundary'
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  override render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return <ErrorFallbackUI 
        error={this.state.error} 
        onRetry={this.handleRetry}
        showDetails={this.props.showErrorDetails ?? false}
        context={this.props.context ?? undefined}
      />;
    }

    return this.props.children;
  }
}

// Functional component for error fallback UI
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  showDetails?: boolean | undefined;
  context?: string | undefined;
}

const ErrorFallbackUI: React.FC<ErrorFallbackProps> = ({ 
  error, 
  onRetry, 
  showDetails = false, 
  context 
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.errorCard, { backgroundColor: theme.colors.surface }]}>
        <Icon 
          name="error-outline" 
          size={48} 
          color={theme.colors.error} 
          style={styles.errorIcon}
        />
        
        <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
          Something went wrong
        </Text>
        
        <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
          {context ? `Error in ${context}` : 'An unexpected error occurred'}
        </Text>
        
        {showDetails && error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorDetailsTitle, { color: theme.colors.textSecondary }]}>
              Error Details:
            </Text>
            <Text style={[styles.errorDetailsText, { color: theme.colors.textSecondary }]}>
              {error.message}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <Icon name="refresh" size={20} color={theme.colors.background} />
          <Text style={[styles.retryButtonText, { color: theme.colors.background }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
  
  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithErrorBoundaryComponent;
};

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context?: string) => {
    globalErrorHandler.reportError(error, { context, source: 'useErrorHandler' });
  }, []);
  
  return handleError;
};

// Safe component wrapper that catches render errors
export const SafeComponent: React.FC<{
  children: ReactNode;
  fallback?: ReactNode | undefined;
  context?: string | undefined;
}> = ({ children, fallback, context }) => {
  return (
    <ErrorBoundary 
      fallback={fallback} 
      context={context}
      showErrorDetails={__DEV__}
    >
      {children}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorDetails: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  errorDetailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  errorDetailsText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ErrorBoundary;