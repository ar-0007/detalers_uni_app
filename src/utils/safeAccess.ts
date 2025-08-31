// Safe Access Utilities
// Comprehensive utilities for safe property and array access to prevent runtime crashes

/**
 * Safely access nested object properties with optional fallback
 * @param obj - The object to access
 * @param path - The property path (e.g., 'user.profile.name' or ['user', 'profile', 'name'])
 * @param fallback - Fallback value if property doesn't exist
 * @returns The property value or fallback
 */
export const safeGet = <T = any>(
  obj: any,
  path: string | string[],
  fallback: T | null = null
): T | null => {
  try {
    if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
      return fallback;
    }

    const keys = Array.isArray(path) ? path : path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current == null || typeof current !== 'object') {
        return fallback;
      }
      current = current[key];
    }

    return current !== undefined ? current : fallback;
  } catch (error) {
    console.warn('safeGet - Error accessing property:', { path, error });
    return fallback;
  }
};

/**
 * Safely access array elements with bounds checking
 * @param array - The array to access
 * @param index - The index to access
 * @param fallback - Fallback value if index is out of bounds
 * @returns The array element or fallback
 */
export const safeArrayAccess = <T = any>(
  array: any,
  index: number,
  fallback: T | null = null
): T | null => {
  try {
    if (!Array.isArray(array)) {
      console.warn('safeArrayAccess - Not an array:', { array, index });
      return fallback;
    }

    if (index < 0 || index >= array.length) {
      console.warn('safeArrayAccess - Index out of bounds:', { index, length: array.length });
      return fallback;
    }

    const element = array[index];
    return element !== undefined ? element : fallback;
  } catch (error) {
    console.warn('safeArrayAccess - Error accessing array element:', { index, error });
    return fallback;
  }
};

/**
 * Safely access object properties with validation
 * @param obj - The object to access
 * @param key - The property key
 * @param fallback - Fallback value if property doesn't exist
 * @returns The property value or fallback
 */
export const safeObjectAccess = <T = any>(
  obj: any,
  key: string | number | symbol,
  fallback: T | null = null
): T | null => {
  try {
    if (!obj || typeof obj !== 'object') {
      console.warn('safeObjectAccess - Not an object:', { obj, key });
      return fallback;
    }

    if (!(key in obj)) {
      return fallback;
    }

    const value = obj[key];
    return value !== undefined ? value : fallback;
  } catch (error) {
    console.warn('safeObjectAccess - Error accessing object property:', { key, error });
    return fallback;
  }
};

/**
 * Safely get the first element of an array
 * @param array - The array to access
 * @param fallback - Fallback value if array is empty
 * @returns The first element or fallback
 */
export const safeFirst = <T = any>(
  array: any,
  fallback: T | null = null
): T | null => {
  return safeArrayAccess(array, 0, fallback);
};

/**
 * Safely get the last element of an array
 * @param array - The array to access
 * @param fallback - Fallback value if array is empty
 * @returns The last element or fallback
 */
export const safeLast = <T = any>(
  array: any,
  fallback: T | null = null
): T | null => {
  if (!Array.isArray(array) || array.length === 0) {
    return fallback;
  }
  return safeArrayAccess(array, array.length - 1, fallback);
};

/**
 * Safely get array length
 * @param array - The array to check
 * @param fallback - Fallback value if not an array
 * @returns The array length or fallback
 */
export const safeLength = (array: any, fallback: number = 0): number => {
  try {
    if (!Array.isArray(array)) {
      return fallback;
    }
    return array.length;
  } catch (error) {
    console.warn('safeLength - Error getting array length:', { array, error });
    return fallback;
  }
};

/**
 * Check if a value is null or undefined
 * @param value - The value to check
 * @returns True if null or undefined
 */
export const isNullOrUndefined = (value: any): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * Check if a value is a valid non-empty string
 * @param value - The value to check
 * @returns True if valid non-empty string
 */
export const isValidString = (value: any): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if a value is a valid non-empty array
 * @param value - The value to check
 * @returns True if valid non-empty array
 */
export const isValidArray = (value: any): value is any[] => {
  return Array.isArray(value) && value.length > 0;
};

/**
 * Check if a value is a valid object (not null, not array)
 * @param value - The value to check
 * @returns True if valid object
 */
export const isValidObject = (value: any): value is object => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Safely execute a function with error handling
 * @param fn - The function to execute
 * @param fallback - Fallback value if function throws
 * @param context - Optional context for logging
 * @returns The function result or fallback
 */
export const safeExecute = <T = any>(
  fn: () => T,
  fallback: T | null = null,
  context?: string
): T | null => {
  try {
    return fn();
  } catch (error) {
    console.warn(`safeExecute${context ? ` (${context})` : ''} - Function execution failed:`, error);
    return fallback;
  }
};

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @param fallback - Fallback value if parsing fails
 * @returns Parsed object or fallback
 */
export const safeJsonParse = <T = any>(
  jsonString: string,
  fallback: T | null = null
): T | null => {
  try {
    if (!isValidString(jsonString)) {
      return fallback;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('safeJsonParse - JSON parsing failed:', { jsonString, error });
    return fallback;
  }
};

/**
 * Create a safe wrapper for async functions
 * @param asyncFn - The async function to wrap
 * @param fallback - Fallback value if function rejects
 * @param context - Optional context for logging
 * @returns Promise that resolves to result or fallback
 */
export const safeAsync = async <T = any>(
  asyncFn: () => Promise<T>,
  fallback: T | null = null,
  context?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.warn(`safeAsync${context ? ` (${context})` : ''} - Async function failed:`, error);
    return fallback;
  }
};