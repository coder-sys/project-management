// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Validate environment variables
export const validateApiConfig = () => {
  const requiredEnvVars = [
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    'NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingVars.length > 0) {
    console.error(
      'Missing required environment variables:',
      missingVars.join(', ')
    );
    return false;
  }

  return true;
};

// API endpoints
export const API_ENDPOINTS = {
  projects: '/projects',
  tasks: '/tasks',
  users: '/users',
  teams: '/teams',
  search: '/search',
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
}; 