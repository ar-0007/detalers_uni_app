import React from 'react';
import { PerformanceMonitor } from './performance';

/**
 * Performance testing utilities for React Native components
 */

interface ComponentTestResult {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  memoryUsage?: number | undefined;
  timestamp: number;
}

interface PerformanceTestConfig {
  iterations?: number;
  warmupIterations?: number;
  measureMemory?: boolean;
  logResults?: boolean;
}

/**
 * Performance test runner for components
 */
export class PerformanceTestRunner {
  private static results: ComponentTestResult[] = [];
  private static isRunning = false;

  /**
   * Test component render performance
   */
  static async testComponentRender(
    componentName: string,
    renderFunction: () => React.ReactElement,
    config: PerformanceTestConfig = {}
  ): Promise<ComponentTestResult> {
    const {
      iterations = 10,
      warmupIterations = 3,
      measureMemory = false,
      logResults = true
    } = config;

    if (this.isRunning) {
      throw new Error('Performance test is already running');
    }

    this.isRunning = true;

    try {
      // Warmup iterations
      for (let i = 0; i < warmupIterations; i++) {
        renderFunction();
      }

      const renderTimes: number[] = [];
      let totalRerenders = 0;
      const initialMemory = measureMemory && (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize
        : 0;

      // Actual test iterations
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        // Simulate component render
        renderFunction();
        
        const endTime = performance.now();
        renderTimes.push(endTime - startTime);
        totalRerenders++;

        // Small delay between iterations
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      const averageRenderTime = renderTimes.length > 0 ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length : 0;
      const finalMemory = measureMemory && (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize
        : 0;

      const result: ComponentTestResult = {
        componentName,
        renderTime: parseFloat(averageRenderTime.toFixed(3)),
        rerenderCount: totalRerenders,
        memoryUsage: measureMemory ? (finalMemory - initialMemory) : undefined,
        timestamp: Date.now()
      };

      this.results.push(result);

      if (logResults) {
        this.logTestResult(result);
      }

      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Benchmark multiple components
   */
  static async benchmarkComponents(
    tests: Array<{
      name: string;
      render: () => React.ReactElement;
    }>,
    config: PerformanceTestConfig = {}
  ): Promise<ComponentTestResult[]> {
    const results: ComponentTestResult[] = [];

    for (const test of tests) {
      const result = await this.testComponentRender(test.name, test.render, config);
      results.push(result);
    }

    if (config.logResults !== false) {
      this.logBenchmarkResults(results);
    }

    return results;
  }

  /**
   * Test animation performance
   */
  static testAnimationPerformance(
    animationName: string,
    animationFunction: () => void,
    duration: number = 1000
  ): Promise<{ averageFPS: number; frameDrops: number }> {
    return new Promise((resolve) => {
      const frames: number[] = [];
      let lastTime = performance.now();
      let frameDrops = 0;
      const targetFPS = 60;
      const targetFrameTime = 1000 / targetFPS;

      const measureFrame = () => {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTime;
        
        if (deltaTime > 0) {
          const fps = 1000 / deltaTime;
          frames.push(fps);
          
          // Count frame drops (frames that take longer than target)
          if (deltaTime > targetFrameTime * 1.5) {
            frameDrops++;
          }
        }
        
        lastTime = currentTime;
        
        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const averageFPS = frames.length > 0 ? frames.reduce((sum, fps) => sum + fps, 0) / frames.length : 0;
          resolve({ averageFPS: parseFloat(averageFPS.toFixed(2)), frameDrops });
        }
      };

      const startTime = performance.now();
      animationFunction();
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Memory leak detection
   */
  static detectMemoryLeaks(
    componentName: string,
    createComponent: () => any,
    destroyComponent: (component: any) => void,
    iterations: number = 100
  ): Promise<{ hasLeak: boolean; memoryGrowth: number }> {
    return new Promise(async (resolvePromise) => {
      if (!(performance as any).memory) {
        resolvePromise({ hasLeak: false, memoryGrowth: 0 });
        return;
      }

      const initialMemory = (performance as any).memory.usedJSHeapSize;
      const components: any[] = [];

      // Create and destroy components multiple times
      for (let i = 0; i < iterations; i++) {
        const component = createComponent();
        components.push(component);
        
        // Destroy every other component to simulate normal usage
        if (i % 2 === 0 && components.length > 1) {
          const componentToDestroy = components.shift();
          destroyComponent(componentToDestroy);
        }

        // Small delay to allow garbage collection
        if (i % 10 === 0) {
          await new Promise(resolveTimeout => setTimeout(resolveTimeout, 10));
        }
      }

      // Clean up remaining components
      components.forEach(destroyComponent);

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      // Wait for garbage collection
      await new Promise(resolveGC => setTimeout(resolveGC, 100));

      const finalMemory = (performance as any).memory.usedJSHeapSize;
      const memoryGrowth = finalMemory - initialMemory;
      const hasLeak = memoryGrowth > 1024 * 1024; // 1MB threshold

      if (hasLeak) {
        console.warn(
          `[Memory Leak] ${componentName} may have a memory leak. ` +
          `Memory grew by ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`
        );
      }

      resolvePromise({ hasLeak, memoryGrowth });
    });
  }

  /**
   * Get all test results
   */
  static getResults(): ComponentTestResult[] {
    return [...this.results];
  }

  /**
   * Clear all test results
   */
  static clearResults(): void {
    this.results = [];
  }

  /**
   * Get performance summary
   */
  static getPerformanceSummary(): {
    totalTests: number;
    averageRenderTime: number;
    slowestComponent: string | null;
    fastestComponent: string | null;
  } {
    if (this.results.length === 0) {
      return {
        totalTests: 0,
        averageRenderTime: 0,
        slowestComponent: null,
        fastestComponent: null
      };
    }

    const totalRenderTime = this.results.reduce((sum, result) => sum + result.renderTime, 0);
    const averageRenderTime = totalRenderTime / this.results.length;
    
    const sortedByRenderTime = [...this.results].sort((a, b) => a.renderTime - b.renderTime);
    const fastestComponent = sortedByRenderTime[0]?.componentName || null;
    const slowestComponent = sortedByRenderTime[sortedByRenderTime.length - 1]?.componentName || null;

    return {
      totalTests: this.results.length,
      averageRenderTime: parseFloat(averageRenderTime.toFixed(3)),
      slowestComponent,
      fastestComponent
    };
  }

  /**
   * Log test result
   */
  private static logTestResult(result: ComponentTestResult): void {
    console.log(`[Performance Test] ${result.componentName}:`);
    console.log(`  Render Time: ${result.renderTime}ms`);
    console.log(`  Rerenders: ${result.rerenderCount}`);
    if (result.memoryUsage !== undefined) {
      console.log(`  Memory Usage: ${(result.memoryUsage / 1024).toFixed(2)} KB`);
    }
  }

  /**
   * Log benchmark results
   */
  private static logBenchmarkResults(results: ComponentTestResult[]): void {
    console.log('\n[Performance Benchmark Results]');
    console.log('================================');
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.componentName}: ${result.renderTime}ms`);
    });
    
    const sortedResults = [...results].sort((a, b) => a.renderTime - b.renderTime);
    console.log(`\nFastest: ${sortedResults[0]?.componentName} (${sortedResults[0]?.renderTime}ms)`);
    console.log(`Slowest: ${sortedResults[sortedResults.length - 1]?.componentName} (${sortedResults[sortedResults.length - 1]?.renderTime}ms)`);
  }
}

/**
 * HOC for automatic performance testing
 */
export const withPerformanceTest = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const PerformanceTestWrapper: React.FC<P> = (props) => {
    React.useEffect(() => {
    if (__DEV__) {
      const componentName = Component.displayName || Component.name || 'Unknown';
      const endMeasurement = PerformanceMonitor.startMeasurement(`${componentName}_render`);
      
      return () => {
        endMeasurement();
      };
    }
    // Return undefined for non-dev environments
    return undefined;
  }, []);

    return React.createElement(Component, props);
  };

  PerformanceTestWrapper.displayName = `PerformanceTest(${Component.displayName || Component.name})`;
  return PerformanceTestWrapper;
};

/**
 * Hook for component-level performance testing
 */
export const usePerformanceTest = (componentName: string) => {
  const renderCountRef = React.useRef(0);
  const mountTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (__DEV__) {
      mountTimeRef.current = performance.now();
      renderCountRef.current = 0;
    }

    return () => {
      if (__DEV__ && mountTimeRef.current) {
        const unmountTime = performance.now();
        const totalLifetime = unmountTime - mountTimeRef.current;
        
        console.log(`[Component Lifetime] ${componentName}:`);
        console.log(`  Total Lifetime: ${totalLifetime.toFixed(2)}ms`);
        console.log(`  Total Renders: ${renderCountRef.current}`);
        console.log(`  Avg Render Interval: ${(totalLifetime / Math.max(renderCountRef.current, 1)).toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  React.useEffect(() => {
    if (__DEV__) {
      renderCountRef.current += 1;
    }
  });

  return {
    renderCount: renderCountRef.current,
    logPerformance: () => {
      if (__DEV__ && mountTimeRef.current) {
        const currentTime = performance.now();
        const lifetime = currentTime - mountTimeRef.current;
        console.log(`[Performance] ${componentName} - Renders: ${renderCountRef.current}, Lifetime: ${lifetime.toFixed(2)}ms`);
      }
    }
  };
};

/**
 * Utility for testing list performance
 */
export const testListPerformance = async (
  listName: string,
  itemCount: number,
  renderItem: (index: number) => React.ReactElement,
  config: PerformanceTestConfig = {}
): Promise<ComponentTestResult> => {
  const renderList = () => {
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      items.push(renderItem(i));
    }
    return React.createElement('div', {}, ...items);
  };

  return PerformanceTestRunner.testComponentRender(
    `${listName}_${itemCount}_items`,
    renderList,
    config
  );
};