import { ErrorInfo } from 'react';

// Error types and interfaces
export interface ErrorDetails {
  message: string;
  stack?: string | undefined;
  componentStack?: string | undefined;
  timestamp: number;
  userId?: string | undefined;
  screenName?: string | undefined;
  errorBoundary?: string | undefined;
  additionalInfo?: Record<string, any> | undefined;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

export interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  resetError: () => void;
  errorId?: string;
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  RENDERING = 'rendering',
  NAVIGATION = 'navigation',
  PAYMENT = 'payment',
  MEDIA = 'media',
  UNKNOWN = 'unknown'
}

// Error reporting utility class
export class ErrorReporter {
  private static instance: ErrorReporter;
  private errorQueue: ErrorDetails[] = [];
  private maxQueueSize = 50;

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  // Generate unique error ID
  generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log error to console and queue for reporting
  logError(error: Error, errorInfo?: ErrorInfo, additionalInfo?: Record<string, any>): string {
    const errorId = this.generateErrorId();
    
    const errorDetails: ErrorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack || undefined,
      timestamp: Date.now(),
      errorBoundary: additionalInfo?.errorBoundary,
      screenName: additionalInfo?.screenName,
      additionalInfo,
    };

    // Log to console for development
    console.group(`🚨 Error Boundary Caught Error [${errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Additional Info:', additionalInfo);
    console.error('Stack Trace:', error.stack);
    if (errorInfo?.componentStack) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
    console.groupEnd();

    // Add to queue
    this.addToQueue(errorDetails);

    // In production, you would send this to your error reporting service
    // this.sendToErrorService(errorDetails);

    return errorId;
  }

  // Add error to queue
  private addToQueue(errorDetails: ErrorDetails): void {
    this.errorQueue.push(errorDetails);
    
    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  // Get error queue (for debugging)
  getErrorQueue(): ErrorDetails[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrorQueue(): void {
    this.errorQueue = [];
  }

  // Categorize error based on message and stack
  categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('auth') || message.includes('token') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('validation') || message.includes('required') || message.includes('invalid')) {
      return ErrorCategory.VALIDATION;
    }
    if (stack.includes('navigation') || message.includes('navigation')) {
      return ErrorCategory.NAVIGATION;
    }
    if (message.includes('payment') || message.includes('stripe') || message.includes('checkout')) {
      return ErrorCategory.PAYMENT;
    }
    if (message.includes('video') || message.includes('audio') || message.includes('media')) {
      return ErrorCategory.MEDIA;
    }
    if (stack.includes('render') || message.includes('render')) {
      return ErrorCategory.RENDERING;
    }
    
    return ErrorCategory.UNKNOWN;
  }

  // Determine error severity
  determineSeverity(error: Error, errorInfo?: ErrorInfo): ErrorSeverity {
    const category = this.categorizeError(error);
    const message = error.message.toLowerCase();

    // Critical errors
    if (category === ErrorCategory.AUTHENTICATION || 
        category === ErrorCategory.PAYMENT ||
        message.includes('crash') ||
        message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (category === ErrorCategory.NETWORK ||
        category === ErrorCategory.NAVIGATION ||
        message.includes('timeout') ||
        message.includes('failed')) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (category === ErrorCategory.VALIDATION ||
        category === ErrorCategory.MEDIA) {
      return ErrorSeverity.MEDIUM;
    }

    // Default to low severity
    return ErrorSeverity.LOW;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(error: Error): string {
    const category = this.categorizeError(error);
    
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication error. Please log in again.';
      case ErrorCategory.VALIDATION:
        return 'Invalid input. Please check your information and try again.';
      case ErrorCategory.NAVIGATION:
        return 'Navigation error. Please try going back and navigating again.';
      case ErrorCategory.PAYMENT:
        return 'Payment processing error. Please try again or contact support.';
      case ErrorCategory.MEDIA:
        return 'Media loading error. Please try refreshing the content.';
      case ErrorCategory.RENDERING:
        return 'Display error. Please try refreshing the screen.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  // Future: Send to error reporting service
  private async sendToErrorService(errorDetails: ErrorDetails): Promise<void> {
    // Implementation for sending to services like Sentry, Bugsnag, etc.
    // This would be implemented based on your chosen error reporting service
    try {
      // Example: await errorReportingService.send(errorDetails);
      console.log('Error would be sent to reporting service:', errorDetails);
    } catch (reportingError) {
      console.error('Failed to send error to reporting service:', reportingError);
    }
  }
}

// Export singleton instance
export const errorReporter = ErrorReporter.getInstance();

// Utility functions
export const logError = (error: Error, errorInfo?: ErrorInfo, additionalInfo?: Record<string, any>): string => {
  return errorReporter.logError(error, errorInfo, additionalInfo);
};

export const getUserFriendlyErrorMessage = (error: Error): string => {
  return errorReporter.getUserFriendlyMessage(error);
};

export const getErrorCategory = (error: Error): ErrorCategory => {
  return errorReporter.categorizeError(error);
};

export const getErrorSeverity = (error: Error, errorInfo?: ErrorInfo): ErrorSeverity => {
  return errorReporter.determineSeverity(error, errorInfo);
};