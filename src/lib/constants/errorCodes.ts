/**
 * Error codes for API responses
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    ACCOUNT_LOCKED: 'AUTH_002',
    ACCOUNT_DISABLED: 'AUTH_003',
    SESSION_EXPIRED: 'AUTH_004',
    INVALID_TOKEN: 'AUTH_005',
    UNAUTHORIZED: 'AUTH_006',
  },
  
  // Validation errors
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    REQUIRED_FIELD: 'VAL_002',
    INVALID_FORMAT: 'VAL_003',
  },
  
  // Server errors
  SERVER: {
    INTERNAL_ERROR: 'SRV_001',
    SERVICE_UNAVAILABLE: 'SRV_002',
    DATABASE_ERROR: 'SRV_003',
  }
};

/**
 * Error messages corresponding to error codes
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'Invalid username or password',
  [ERROR_CODES.AUTH.ACCOUNT_LOCKED]: 'Your account has been locked. Please contact support',
  [ERROR_CODES.AUTH.ACCOUNT_DISABLED]: 'Your account has been disabled',
  [ERROR_CODES.AUTH.SESSION_EXPIRED]: 'Your session has expired. Please login again',
  [ERROR_CODES.AUTH.INVALID_TOKEN]: 'Invalid authentication token',
  [ERROR_CODES.AUTH.UNAUTHORIZED]: 'You are not authorized to perform this action',
  
  // Validation errors
  [ERROR_CODES.VALIDATION.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.VALIDATION.REQUIRED_FIELD]: 'Required field is missing',
  [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 'Invalid format',
  
  // Server errors
  [ERROR_CODES.SERVER.INTERNAL_ERROR]: 'An internal server error occurred',
  [ERROR_CODES.SERVER.SERVICE_UNAVAILABLE]: 'Service is currently unavailable',
  [ERROR_CODES.SERVER.DATABASE_ERROR]: 'Database error occurred'
};

/**
 * Get error message from error code
 * @param code Error code
 * @param defaultMessage Default message if code is not found
 * @returns Error message
 */
export const getErrorMessage = (code: string, defaultMessage: string = 'An error occurred'): string => {
  return ERROR_MESSAGES[code] || defaultMessage;
};
