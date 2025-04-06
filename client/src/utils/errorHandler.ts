import { toast } from "@/hooks/use-toast";
import { logError } from "./logger";

/**
 * Error severities to help differentiate between types of errors
 */
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

/**
 * Standard error response interface for API errors
 */
export interface ApiErrorResponse {
  status: number;
  message: string;
  details?: string;
}

/**
 * Error type groups to help with error handling and reporting
 */
export enum ErrorType {
  NETWORK = "network",
  AUTH = "auth", 
  VALIDATION = "validation",
  SERVER = "server",
  CLIENT = "client",
  UNKNOWN = "unknown"
}

/**
 * Options for handling errors with the handleError function
 */
interface ErrorHandlerOptions {
  component: string;
  title?: string;
  fallbackMessage?: string;
  severity?: ErrorSeverity;
  showToast?: boolean;
  logError?: boolean;
  onError?: (error: any) => void;
}

/**
 * Determines the type of error for better handling
 * @param error The error to analyze
 * @returns The type of error
 */
export function getErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
  // Network errors
  if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
    return ErrorType.NETWORK;
  }
  
  // Authentication errors
  if (error.status === 401 || error.status === 403 || error.message?.includes('Unauthorized')) {
    return ErrorType.AUTH;
  }
  
  // Validation errors
  if (error.status === 400 || error.message?.includes('Validation')) {
    return ErrorType.VALIDATION;
  }
  
  // Server errors
  if (error.status && error.status >= 500) {
    return ErrorType.SERVER;
  }
  
  // Client errors that are not auth or validation
  if (error.status && error.status >= 400 && error.status < 500) {
    return ErrorType.CLIENT;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Gets a human-readable error message from an error object
 * @param error The error object
 * @param fallback A fallback message if no message can be extracted
 * @returns A human-readable error message
 */
export function getErrorMessage(error: any, fallback = "An unexpected error occurred"): string {
  if (!error) return fallback;
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message || fallback;
  }
  
  // Handle API error responses
  if (error.message) {
    return error.message;
  }
  
  // Handle plain strings
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle response objects
  if (error.status && error.statusText) {
    return `${error.status}: ${error.statusText}`;
  }
  
  return fallback;
}

/**
 * Centralized error handler for consistent error handling across the app
 * @param error The error to handle
 * @param options Options for handling the error
 */
export function handleError(error: any, options: ErrorHandlerOptions): void {
  const { 
    component, 
    title = "Error", 
    fallbackMessage = "An unexpected error occurred", 
    severity = ErrorSeverity.ERROR, 
    showToast = true, 
    logError: shouldLogError = true,
    onError
  } = options;
  
  // Get the error message
  const errorMessage = getErrorMessage(error, fallbackMessage);
  const errorType = getErrorType(error);
  
  // Log the error
  if (shouldLogError) {
    logError(component, { error, errorType, severity });
  }
  
  // Show a toast notification
  if (showToast) {
    toast({
      title,
      description: errorMessage,
      variant: severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL 
        ? "destructive" 
        : "default",
    });
  }
  
  // Call the onError callback if provided
  if (onError) {
    onError(error);
  }
}

/**
 * Wraps an async function with standardized error handling
 * @param asyncFn The async function to wrap
 * @param options Options for handling errors
 * @returns A wrapped function with error handling
 */
export function withErrorHandling<T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>,
  options: ErrorHandlerOptions
): (...args: Args) => Promise<T | null> {
  return async (...args: Args): Promise<T | null> => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, options);
      return null;
    }
  };
}

/**
 * Wrapper for API calls to provide standardized error handling
 * @param component The component making the API call
 * @param apiCall The API call function to wrap
 * @param successHandler Function to handle successful API responses
 * @param title Custom title for error toasts
 * @returns A function that calls the API with error handling
 */
export function createApiHandler<T, Args extends any[]>(
  component: string,
  apiCall: (...args: Args) => Promise<T>,
  successHandler?: (result: T) => void,
  errorOptions: Partial<ErrorHandlerOptions> = {}
): (...args: Args) => Promise<T | null> {
  return async (...args: Args): Promise<T | null> => {
    try {
      const result = await apiCall(...args);
      if (successHandler) {
        successHandler(result);
      }
      return result;
    } catch (error) {
      handleError(error, {
        component,
        showToast: true,
        logError: true,
        ...errorOptions
      });
      return null;
    }
  };
}