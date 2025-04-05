
// Environment configuration utility

// Define the available environments
export type Environment = 'local' | 'dev' | 'uat' | 'production';

// Default to development if not specified
export const getCurrentEnvironment = (): Environment => {
  return (import.meta.env.VITE_APP_ENV as Environment) || 'dev';
};

// Get API URL based on current environment
export const getApiUrl = (): string => {
  const env = getCurrentEnvironment();
  return import.meta.env.VITE_API_URL || getDefaultApiUrl(env);
};

// Get Socket URL based on current environment
export const getSocketUrl = (): string => {
  const env = getCurrentEnvironment();
  return import.meta.env.VITE_SOCKET_URL || getDefaultSocketUrl(env);
};

// Default API URLs per environment (fallback values)
const getDefaultApiUrl = (env: Environment): string => {
  switch (env) {
    case 'local':
      return 'http://localhost:3000/api';
    case 'dev':
      return 'https://dev-api.instantcommsnexus.com';
    case 'uat':
      return 'https://uat-api.instantcommsnexus.com';
    case 'production':
      return 'https://api.instantcommsnexus.com';
    default:
      return 'https://dev-api.instantcommsnexus.com';
  }
};

// Default Socket URLs per environment (fallback values)
const getDefaultSocketUrl = (env: Environment): string => {
  switch (env) {
    case 'local':
      return 'http://localhost:3000';
    case 'dev':
      return 'https://dev-socket.instantcommsnexus.com';
    case 'uat':
      return 'https://uat-socket.instantcommsnexus.com';
    case 'production':
      return 'https://socket.instantcommsnexus.com';
    default:
      return 'https://dev-socket.instantcommsnexus.com';
  }
};

// Get environment display name
export const getEnvironmentDisplayName = (): string => {
  const env = getCurrentEnvironment();
  switch (env) {
    case 'local':
      return 'Local';
    case 'dev':
      return 'Development';
    case 'uat':
      return 'UAT';
    case 'production':
      return '';  // No display for production
    default:
      return 'Development';
  }
};

// Check if current environment is production
export const isProduction = (): boolean => {
  return getCurrentEnvironment() === 'production';
};
