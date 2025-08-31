import { useCallback, useMemo, useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

/**
 * Hook for memoizing expensive calculations with dependency tracking
 */
export const useExpensiveMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  debugName?: string
): T => {
  const startTime = useRef<number>(0);
  
  return useMemo(() => {
    if (__DEV__ && debugName) {
      // Add safety check for performance.now() availability
      if (typeof performance !== 'undefined' && performance.now) {
        startTime.current = performance.now();
      }
    }
    
    const result = factory();
    
    if (__DEV__ && debugName && startTime.current !== 0) {
      // Add safety check for performance.now() availability
      if (typeof performance !== 'undefined' && performance.now) {
        const endTime = performance.now();
        const duration = endTime - startTime.current;
        if (duration > 16) { // Warn if calculation takes longer than one frame
          console.warn(`[Performance] ${debugName} took ${duration.toFixed(2)}ms`);
        }
      }
    }
    
    return result;
  }, deps);
};

/**
 * Hook for debounced callbacks to prevent excessive re-renders
 */
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoize the callback to prevent infinite re-renders
  const memoizedCallback = useCallback(callback, deps);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      memoizedCallback(...args);
    }, delay);
  }, [memoizedCallback, delay]) as T;
};

/**
 * Hook for throttled callbacks to limit execution frequency
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoize the callback to prevent infinite re-renders
  const memoizedCallback = useCallback(callback, deps);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    if (timeSinceLastCall >= delay) {
      lastCallRef.current = now;
      memoizedCallback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        memoizedCallback(...args);
      }, delay - timeSinceLastCall);
    }
  }, [memoizedCallback, delay]) as T;
};

/**
 * Hook for running expensive operations after interactions complete
 */
export const useInteractionCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T => {
  return useCallback((...args: Parameters<T>) => {
    InteractionManager.runAfterInteractions(() => {
      callback(...args);
    });
  }, deps) as T;
};

/**
 * Hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string) => {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (__DEV__) {
      renderCountRef.current += 1;
      
      // Add safety check for performance.now() availability
      if (typeof performance !== 'undefined' && performance.now) {
        const now = performance.now();
        
        if (lastRenderTimeRef.current !== 0) {
          const timeSinceLastRender = now - lastRenderTimeRef.current;
          
          // Log if component is re-rendering too frequently
          if (timeSinceLastRender < 16 && renderCountRef.current > 1) {
            console.warn(
              `[Performance] ${componentName} re-rendered ${renderCountRef.current} times in ${timeSinceLastRender.toFixed(2)}ms`
            );
          }
        }
        
        lastRenderTimeRef.current = now;
      }
    }
  });
  
  return {
    renderCount: renderCountRef.current,
    resetRenderCount: () => {
      renderCountRef.current = 0;
    }
  };
};

/**
 * Hook for stable object references to prevent unnecessary re-renders
 */
export const useStableObject = <T extends Record<string, any>>(
  obj: T,
  deps: React.DependencyList
): T => {
  return useMemo(() => obj, deps);
};

/**
 * Hook for stable array references to prevent unnecessary re-renders
 */
export const useStableArray = <T>(
  arr: T[],
  deps: React.DependencyList
): T[] => {
  return useMemo(() => arr, deps);
};

/**
 * Hook for memoizing style objects
 */
export const useStableStyles = <T extends Record<string, any>>(
  styleFactory: () => T,
  deps: React.DependencyList
): T => {
  return useMemo(styleFactory, deps);
};

/**
 * Hook for preventing unnecessary re-renders when props haven't changed
 */
export const useShallowMemo = <T extends Record<string, any>>(props: T): T => {
  const prevPropsRef = useRef<T>(props);
  const propsKeysRef = useRef<string>('');
  
  return useMemo(() => {
    const prevProps = prevPropsRef.current;
    const keys = Object.keys(props) as (keyof T)[];
    const currentKeysString = keys.sort().join(',');
    
    // Check if keys have changed first
    if (propsKeysRef.current !== currentKeysString) {
      propsKeysRef.current = currentKeysString;
      prevPropsRef.current = props;
      return props;
    }
    
    // Check if any prop has changed (shallow comparison)
    const hasChanged = keys.some(key => props[key] !== prevProps[key]);
    
    if (!hasChanged) {
      return prevProps;
    }
    
    prevPropsRef.current = props;
    return props;
  }, [Object.values(props).join('|')]);
};