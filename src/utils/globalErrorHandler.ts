import { store } from '../store';
import { safeGet, safeArrayAccess, safeObjectAccess, isValidArray, isValidObject } from './safeAccess';

// Try to import ErrorUtils safely
let ErrorUtils: any = null;
try {
  const RN = require('react-native');
  ErrorUtils = RN.ErrorUtils;
} catch (e) {
  console.warn('ErrorUtils not available, using fallback implementation');
}

// Extend global interface for better TypeScript support
declare global {
  var onunhandledrejection: ((event: any) => void) | undefined;
  var lastNetworkErrorTime: number;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  lineNumber?: number;
  columnNumber?: number;
  source?: string;
}

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private errorQueue: ErrorInfo[] = [];
  private isProcessing = false;

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  init() {
    try {
      // Handle JavaScript errors only if ErrorUtils is available
      if (ErrorUtils && typeof ErrorUtils.getGlobalHandler === 'function') {
        const originalHandler = ErrorUtils.getGlobalHandler();
        ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
          this.handleError(error, { isFatal, source: 'global' });
          if (originalHandler) {
            originalHandler(error, isFatal);
          }
        });
      } else {
        console.warn('ErrorUtils not available, skipping global error handler setup');
        // Set up alternative error handling
        this.setupFallbackErrorHandling();
      }
    } catch (e) {
      console.warn('Failed to setup ErrorUtils global handler:', e);
      this.setupFallbackErrorHandling();
    }

    // Handle unhandled promise rejections
    if (typeof global !== 'undefined' && 'HermesInternal' in global) {
      const originalRejectionHandler = (global as any).onunhandledrejection;
      (global as any).onunhandledrejection = (event: any) => {
        this.handleError(new Error(event.reason), { source: 'promise' });
        if (originalRejectionHandler) {
          originalRejectionHandler(event);
        }
      };
    }

    // Handle console errors
    this.setupConsoleErrorHandling();
  }

  private setupFallbackErrorHandling() {
    // Fallback error handling when ErrorUtils is not available
    // In React Native, we use global error handlers instead of window events
    try {
      // Handle global errors using process if available
      if (typeof process !== 'undefined' && process.on) {
        process.on('uncaughtException', (error: Error) => {
          this.handleError(error, { source: 'uncaughtException' });
        });
        
        process.on('unhandledRejection', (reason: any) => {
          const error = reason instanceof Error ? reason : new Error(String(reason));
          this.handleError(error, { source: 'unhandledRejection' });
        });
      }
      
      // Alternative: Use global object for React Native
      if (typeof global !== 'undefined') {
        const originalHandler = (global as any).__handleUncaughtException;
        (global as any).__handleUncaughtException = (error: Error) => {
          this.handleError(error, { source: 'global' });
          if (originalHandler) {
            originalHandler(error);
          }
        };
      }
    } catch (e) {
      console.warn('Failed to setup fallback error handling:', e);
    }
  }

  private setupConsoleErrorHandling() {
    try {
      const originalConsoleError = console.error;
      let isProcessingError = false; // Guard to prevent recursive calls
      
      console.error = (...args: any[]) => {
        // Prevent recursive calls
        if (isProcessingError) {
          originalConsoleError.apply(console, args);
          return;
        }
        
        try {
          isProcessingError = true;
          
          const message = args.map(arg => {
            try {
              return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
            } catch (e) {
              return '[Object - circular reference or non-serializable]';
            }
          }).join(' ');
          
          if (this.isLengthUndefinedError(message)) {
            this.handleLengthUndefinedError(message, args);
          }
        } catch (e) {
          // Silently handle errors in error processing to prevent crash loops
        } finally {
          isProcessingError = false;
        }
        
        originalConsoleError.apply(console, args);
      };
    } catch (e) {
      console.warn('Failed to setup console error handling:', e);
    }
  }

  private isLengthUndefinedError(message: string): boolean {
    return message.toLowerCase().includes('length') && 
           message.toLowerCase().includes('undefined');
  }

  private handleLengthUndefinedError(message: string, args: any[]) {
    try {
      console.warn('🔍 LENGTH UNDEFINED ERROR DETECTED:', {
        message,
        argsCount: args.length,
        timestamp: new Date().toISOString(),
        stack: new Error().stack,
        reduxState: this.getReduxStateSnapshot()
      });

      // Try to identify the source
      const stack = new Error().stack;
      if (stack) {
        const stackLines = stack.split('\n');
        const relevantLines = stackLines.filter(line => 
          line.includes('.tsx') || line.includes('.ts')
        ).slice(0, 5);
        
        console.warn('📍 Potential source locations:', relevantLines);
      }
    } catch (e) {
      // Silently handle errors in error logging to prevent crash loops
      console.warn('Error in handleLengthUndefinedError:', e);
    }
  }

  private handleError(error: Error, context: any = {}) {
    try {
      const errorInfo: ErrorInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: Date.now(),
        ...context
      };

      // Check if it's a length undefined error
      if (error.message && this.isLengthUndefinedError(error.message)) {
        this.handleLengthUndefinedError(error.message, [error]);
      }

      this.errorQueue.push(errorInfo);
      this.processErrorQueue();
    } catch (e) {
      // Prevent error handler from crashing the app
      console.warn('Error in handleError:', e);
    }
  }

  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      while (this.errorQueue.length > 0) {
        const error = this.errorQueue.shift();
        if (error) {
          await this.logError(error);
        }
      }
    } catch (e) {
      console.warn('Error processing error queue:', e);
    } finally {
      this.isProcessing = false;
    }
  }

  private async logError(errorInfo: ErrorInfo) {
    // Log to console in development using console.warn to avoid recursive calls
    if (__DEV__) {
      console.group('🚨 Global Error Handler');
      console.warn('Error:', errorInfo.message);
      console.warn('Stack:', errorInfo.stack);
      console.warn('Context:', errorInfo);
      console.groupEnd();
    }

    // In production, you might want to send to crash reporting service
    // await crashlytics().recordError(new Error(errorInfo.message));
  }

  private getReduxStateSnapshot() {
    try {
      const state = store.getState();
      return {
        auth: {
          isAuthenticated: state.auth?.isAuthenticated,
          user: state.auth?.user ? 'present' : 'null'
        },
        course: {
          coursesLength: Array.isArray(state.course?.courses) ? state.course.courses.length : 'not-array',
          categoriesLength: Array.isArray(state.course?.categories) ? state.course.categories.length : 'not-array',
          isLoading: state.course?.isLoading
        },
        user: {
          profileExists: !!state.user?.profile
        }
      };
    } catch (e) {
      return { error: 'Failed to get state snapshot' };
    }
  }

  // Method to manually report errors
  reportError(error: Error | string, context?: any) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    this.handleError(errorObj, context);
  }

  // Enhanced safe access methods using the new utilities
  static safeArrayAccess<T>(array: T[] | null | undefined, defaultValue: T[] = []): T[] {
    return isValidArray(array) ? array : defaultValue;
  }

  // Method to safely get array length
  static safeLength(array: any[] | null | undefined): number {
    return isValidArray(array) ? array.length : 0;
  }

  // Method to safely access nested properties
  static safeGet<T = any>(obj: any, path: string | string[], fallback: T | null = null): T | null {
    return safeGet(obj, path, fallback);
  }

  // Method to safely access object properties
  static safeObjectAccess<T = any>(obj: any, key: string | number | symbol, fallback: T | null = null): T | null {
    return safeObjectAccess(obj, key, fallback);
  }

  // Method to validate critical data structures
  validateDataStructure(data: any, expectedStructure: any, context: string = 'unknown'): boolean {
    try {
      if (!isValidObject(data)) {
        console.warn(`Data validation failed - not an object in ${context}:`, data);
        return false;
      }

      for (const [key, expectedType] of Object.entries(expectedStructure)) {
        const value = safeObjectAccess(data, key);
        
        if (expectedType === 'required' && (value === null || value === undefined)) {
          console.warn(`Data validation failed - missing required field '${key}' in ${context}`);
          return false;
        }
        
        if (expectedType === 'array' && !isValidArray(value)) {
          console.warn(`Data validation failed - field '${key}' should be array in ${context}:`, value);
          return false;
        }
        
        if (expectedType === 'object' && !isValidObject(value)) {
          console.warn(`Data validation failed - field '${key}' should be object in ${context}:`, value);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.warn(`Data validation error in ${context}:`, error);
      return false;
    }
  }

  // Method to create error boundaries for risky operations
  static withErrorBoundary<T>(
    operation: () => T,
    fallback: T,
    context: string = 'unknown operation'
  ): T {
    try {
      return operation();
    } catch (error) {
      console.warn(`Error boundary caught error in ${context}:`, error);
      globalErrorHandler.reportError(error instanceof Error ? error : new Error(String(error)), { context });
      return fallback;
    }
  }

  // Method to create async error boundaries
  static async withAsyncErrorBoundary<T>(
    operation: () => Promise<T>,
    fallback: T,
    context: string = 'unknown async operation'
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn(`Async error boundary caught error in ${context}:`, error);
      globalErrorHandler.reportError(error instanceof Error ? error : new Error(String(error)), { context });
      return fallback;
    }
  }
}

export default GlobalErrorHandler;
export const globalErrorHandler = GlobalErrorHandler.getInstance();
// Note: safeArrayAccess and safeLength are now available from './safeAccess'