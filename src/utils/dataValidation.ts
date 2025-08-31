// Data Validation Utilities
// Comprehensive validation for API responses and critical data structures

import { isValidArray, isValidObject, isValidString } from './safeAccess';
import { globalErrorHandler } from './globalErrorHandler';

// Type guards for common data structures
export const isUser = (data: any): data is { user_id: string; email: string } => {
  return isValidObject(data) && 
         isValidString((data as Record<string, any>).user_id) && 
         isValidString((data as Record<string, any>).email);
};

export const isCourse = (data: any): data is { course_id: string; title: string } => {
  return isValidObject(data) && 
         isValidString((data as Record<string, any>).course_id) && 
         isValidString((data as Record<string, any>).title);
};

export const isChapter = (data: any): data is { chapter_id: string; title: string; course_id: string } => {
  return isValidObject(data) && 
         isValidString((data as Record<string, any>).chapter_id) && 
         isValidString((data as Record<string, any>).title) && 
         isValidString((data as Record<string, any>).course_id);
};

export const isApiResponse = (data: any): data is { success: boolean; data?: any; error?: any } => {
  return isValidObject(data) && typeof (data as Record<string, any>).success === 'boolean';
};

// Validation schemas
export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validator?: (value: any) => boolean;
  };
}

// Common validation schemas
export const USER_SCHEMA: ValidationSchema = {
  user_id: { type: 'string', required: true, minLength: 1 },
  email: { type: 'string', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  first_name: { type: 'string', required: false },
  last_name: { type: 'string', required: false },
  created_at: { type: 'string', required: false },
};

export const COURSE_SCHEMA: ValidationSchema = {
  course_id: { type: 'string', required: true, minLength: 1 },
  title: { type: 'string', required: true, minLength: 1 },
  description: { type: 'string', required: false },
  instructor_id: { type: 'string', required: false },
  price: { type: 'number', required: false },
  duration_hours: { type: 'number', required: false },
  level: { type: 'string', required: false },
  thumbnail_url: { type: 'string', required: false },
  intro_video_url: { type: 'string', required: false },
  created_at: { type: 'string', required: false },
};

export const CHAPTER_SCHEMA: ValidationSchema = {
  chapter_id: { type: 'string', required: true, minLength: 1 },
  course_id: { type: 'string', required: true, minLength: 1 },
  title: { type: 'string', required: true, minLength: 1 },
  content: { type: 'string', required: false },
  video_url: { type: 'string', required: false },
  order_index: { type: 'number', required: false },
  duration_minutes: { type: 'number', required: false },
  created_at: { type: 'string', required: false },
};

export const API_RESPONSE_SCHEMA: ValidationSchema = {
  success: { type: 'boolean', required: true },
  data: { type: 'object', required: false },
  error: { type: 'object', required: false },
  message: { type: 'string', required: false },
};

// Main validation function
export const validateData = (
  data: Record<string, any> | any, 
  schema: ValidationSchema, 
  context: string = 'unknown'
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  try {
    if (!isValidObject(data)) {
      errors.push(`Data is not a valid object in ${context}`);
      return { isValid: false, errors };
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const value = (data as Record<string, any>)[fieldName];
      const fieldContext = `${context}.${fieldName}`;
      
      // Check required fields
      if (fieldSchema.required && (value === null || value === undefined)) {
        errors.push(`Required field '${fieldName}' is missing in ${context}`);
        continue;
      }
      
      // Skip validation for optional fields that are null/undefined
      if (!fieldSchema.required && (value === null || value === undefined)) {
        continue;
      }
      
      // Type validation
      const typeError = validateFieldType(value, fieldSchema.type, fieldContext);
      if (typeError) {
        errors.push(typeError);
        continue;
      }
      
      // String-specific validations
      if (fieldSchema.type === 'string' && typeof value === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`Field '${fieldName}' is too short (min: ${fieldSchema.minLength}) in ${context}`);
        }
        
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`Field '${fieldName}' is too long (max: ${fieldSchema.maxLength}) in ${context}`);
        }
        
        if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
          errors.push(`Field '${fieldName}' does not match required pattern in ${context}`);
        }
      }
      
      // Custom validator
      if (fieldSchema.validator && !fieldSchema.validator(value)) {
        errors.push(`Field '${fieldName}' failed custom validation in ${context}`);
      }
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
      console.warn(`Data validation failed for ${context}:`, errors);
      globalErrorHandler.reportError(
        new Error(`Data validation failed: ${errors.join(', ')}`),
        { context, validationErrors: errors }
      );
    }
    
    return { isValid, errors };
  } catch (error) {
    const errorMessage = `Validation error in ${context}: ${error instanceof Error ? error.message : String(error)}`;
    errors.push(errorMessage);
    globalErrorHandler.reportError(
      error instanceof Error ? error : new Error(errorMessage),
      { context }
    );
    return { isValid: false, errors };
  }
};

// Helper function to validate field types
const validateFieldType = (value: any, expectedType: string, context: string): string | null => {
  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return `Field should be string but got ${typeof value} in ${context}`;
      }
      break;
      
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return `Field should be number but got ${typeof value} in ${context}`;
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `Field should be boolean but got ${typeof value} in ${context}`;
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        return `Field should be array but got ${typeof value} in ${context}`;
      }
      break;
      
    case 'object':
      if (!isValidObject(value)) {
        return `Field should be object but got ${typeof value} in ${context}`;
      }
      break;
      
    case 'date':
      if (!(value instanceof Date) && typeof value !== 'string') {
        return `Field should be date or date string but got ${typeof value} in ${context}`;
      }
      if (typeof value === 'string' && isNaN(Date.parse(value))) {
        return `Field should be valid date string in ${context}`;
      }
      break;
      
    default:
      return `Unknown field type '${expectedType}' in ${context}`;
  }
  
  return null;
};

// Validate API response structure
export const validateApiResponse = (response: any, context: string = 'API response'): boolean => {
  const { isValid } = validateData(response, API_RESPONSE_SCHEMA, context);
  return isValid;
};

// Validate array of items with schema
export const validateArray = <T>(
  array: any, 
  itemSchema: ValidationSchema, 
  context: string = 'array'
): { isValid: boolean; validItems: T[]; errors: string[] } => {
  const errors: string[] = [];
  const validItems: T[] = [];
  
  if (!isValidArray(array)) {
    errors.push(`Expected array but got ${typeof array} in ${context}`);
    return { isValid: false, validItems, errors };
  }
  
  array.forEach((item: any, index: number) => {
    const itemContext = `${context}[${index}]`;
    const { isValid, errors: itemErrors } = validateData(item, itemSchema, itemContext);
    
    if (isValid) {
      validItems.push(item as T);
    } else {
      errors.push(...itemErrors);
    }
  });
  
  return {
    isValid: errors.length === 0,
    validItems,
    errors
  };
};

// Safe data extraction with validation
export const extractValidData = <T>(
  data: any,
  schema: ValidationSchema,
  context: string = 'data extraction'
): T | null => {
  const { isValid } = validateData(data, schema, context);
  return isValid ? (data as T) : null;
};

// Validate and sanitize user input
export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  if (!isValidString(input)) {
    return '';
  }
  
  // Basic sanitization
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
    .replace(/\s+/g, ' '); // Normalize whitespace
};

// Create type-safe validators for specific data types
export const createValidator = <T>(schema: ValidationSchema) => {
  return (data: any, context?: string): data is T => {
    const { isValid } = validateData(data, schema, context || 'validation');
    return isValid;
  };
};

// Pre-built validators
export const isValidUser = createValidator<any>(USER_SCHEMA);
export const isValidCourse = createValidator<any>(COURSE_SCHEMA);
export const isValidChapter = createValidator<any>(CHAPTER_SCHEMA);
export const isValidApiResponse = createValidator<any>(API_RESPONSE_SCHEMA);