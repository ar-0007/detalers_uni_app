 import React from 'react';

/**
 * Higher-order component for automatic memoization
 */
export const withMemo = <P extends object>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  const MemoizedComponent = React.memo(Component, areEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};

/**
 * Shallow comparison function for React.memo
 */
export const shallowEqual = <T extends Record<string, any>>(
  prevProps: T,
  nextProps: T
): boolean => {
  const keys1 = Object.keys(prevProps) as (keyof T)[];
  const keys2 = Object.keys(nextProps) as (keyof T)[];
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (const key of keys1) {
    if (prevProps[key] !== nextProps[key]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Deep comparison function for complex objects
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    
    return true;
  }
  
  return false;
};

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();
  
  static startMeasurement(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, []);
      }
      
      this.measurements.get(name)!.push(duration);
      
      if (__DEV__) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
    };
  }
  
  static getAverageTime(name: string): number {
    const times = this.measurements.get(name);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  static getStats(name: string) {
    const times = this.measurements.get(name);
    if (!times || times.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0 };
    }
    
    const average = this.getAverageTime(name);
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return {
      count: times.length,
      average: parseFloat(average.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2))
    };
  }
  
  static clearMeasurements(name?: string) {
    if (name) {
      this.measurements.delete(name);
    } else {
      this.measurements.clear();
    }
  }
  
  static getAllStats() {
    const stats: Record<string, ReturnType<typeof PerformanceMonitor.getStats>> = {};
    
    for (const [name] of this.measurements) {
      stats[name] = this.getStats(name);
    }
    
    return stats;
  }
}

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
};

/**
 * Memoization utility for expensive calculations
 */
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
};

/**
 * Batch updates to prevent excessive re-renders
 */
export class BatchUpdater {
  private static pendingUpdates: Set<() => void> = new Set();
  private static isScheduled = false;
  
  static schedule(updateFn: () => void) {
    this.pendingUpdates.add(updateFn);
    
    if (!this.isScheduled) {
      this.isScheduled = true;
      
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        this.isScheduled = false;
        
        updates.forEach(updateCallback => updateCallback());
      });
    }
  }
}

/**
 * Memory usage monitoring (development only)
 */
export const memoryMonitor = {
  logMemoryUsage: (label: string) => {
    if (__DEV__ && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log(`[Memory] ${label}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  },
  
  trackMemoryLeaks: (componentName: string) => {
    if (__DEV__) {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      return () => {
        const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
        const diff = currentMemory - initialMemory;
        
        if (diff > 1024 * 1024) { // 1MB threshold
          console.warn(
            `[Memory Leak] ${componentName} may have a memory leak. ` +
            `Memory increased by ${(diff / 1024 / 1024).toFixed(2)} MB`
          );
        }
      };
    }
    
    return () => {};
  }
};

/**
 * FPS monitoring utility
 */
export class FPSMonitor {
  private static frames: number[] = [];
  private static lastTime = performance.now();
  private static isRunning = false;
  
  static start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.frames = [];
    this.lastTime = performance.now();
    
    const measureFrame = () => {
      if (!this.isRunning) return;
      
      const currentTime = performance.now();
      const delta = currentTime - this.lastTime;
      
      if (delta > 0) {
        const fps = 1000 / delta;
        this.frames.push(fps);
        
        // Keep only last 60 frames
        if (this.frames.length > 60) {
          this.frames.shift();
        }
      }
      
      this.lastTime = currentTime;
      requestAnimationFrame(measureFrame);
    };
    
    requestAnimationFrame(measureFrame);
  }
  
  static stop() {
    this.isRunning = false;
  }
  
  static getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return sum / this.frames.length;
  }
  
  static getCurrentFPS(): number {
    return this.frames[this.frames.length - 1] || 0;
  }
}