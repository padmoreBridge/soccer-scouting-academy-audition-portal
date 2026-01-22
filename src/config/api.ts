/**
 * API Configuration
 * Base URL and environment-based configuration
 */

const getBaseURL = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Default to development URL
  if (import.meta.env.DEV) {
    return 'http://localhost:6003/api';
  }
  
  // Production URL (update with your production domain)
  return 'https://your-production-domain.com/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
  TIMEOUT: 30000, // 30 seconds
} as const;
