
/**
 * Log levels for different types of logging
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Configuration for logging behavior
 */
export const LogConfig = {
  // Set to true to disable all logging in production
  disable: process.env.NODE_ENV === 'production' && !process.env.VITE_ENABLE_LOGS,
  
  // Minimum log level to display
  minLevel: process.env.NODE_ENV === 'production' 
    ? LogLevel.WARNING 
    : LogLevel.DEBUG,
    
  // Enable timestamps in logs
  showTimestamps: true
};

/**
 * Format a log prefix with component name and optional timestamp
 */
const formatLogPrefix = (component: string, level: LogLevel): string => {
  const timestamp = LogConfig.showTimestamps ? `[${new Date().toISOString()}]` : '';
  return `${timestamp}[${component}][${level.toUpperCase()}]`;
};

/**
 * Log state changes within components
 */
export const logStateChange = (component: string, action: string, data?: any) => {
  if (LogConfig.disable || LogLevel.INFO < LogConfig.minLevel) return;
  console.log(`${formatLogPrefix(component, LogLevel.INFO)} ${action}`, data || '');
};

/**
 * Log debug information 
 */
export const logDebug = (component: string, message: string, data?: any) => {
  if (LogConfig.disable || LogLevel.DEBUG < LogConfig.minLevel) return;
  console.debug(`${formatLogPrefix(component, LogLevel.DEBUG)} ${message}`, data || '');
};

/**
 * Log general information
 */
export const logInfo = (component: string, message: string, data?: any) => {
  if (LogConfig.disable || LogLevel.INFO < LogConfig.minLevel) return;
  console.info(`${formatLogPrefix(component, LogLevel.INFO)} ${message}`, data || '');
};

/**
 * Log warning information
 */
export const logWarning = (component: string, message: string, data?: any) => {
  if (LogConfig.disable || LogLevel.WARNING < LogConfig.minLevel) return;
  console.warn(`${formatLogPrefix(component, LogLevel.WARNING)} ${message}`, data || '');
};

/**
 * Log errors with enhanced details
 */
export const logError = (component: string, error: any) => {
  if (LogConfig.disable || LogLevel.ERROR < LogConfig.minLevel) return;
  
  // Extract error type and details if available
  const errorType = error.errorType || 'UNKNOWN';
  const severity = error.severity || 'ERROR';
  
  console.error(
    `${formatLogPrefix(component, LogLevel.ERROR)} ${errorType}(${severity})`, 
    error.error || error
  );
};
