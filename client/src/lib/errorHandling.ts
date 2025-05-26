// Custom error handler for API calls
export const handleApiError = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  // Handle RTK Query errors
  if ('status' in error) {
    switch (error.status) {
      case 401:
        return 'You must be logged in to perform this action';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'The requested resource was not found';
      case 500:
        return 'An internal server error occurred';
      case 'FETCH_ERROR':
        return 'Network error - please check your connection';
      case 'PARSING_ERROR':
        return 'Error processing server response';
      case 'CUSTOM_ERROR':
        return error.error || 'An unexpected error occurred';
      default:
        return error.data?.message || 'An unexpected error occurred';
    }
  }

  // Handle AWS Amplify errors
  if (error.name === 'NotAuthorizedException') {
    return 'Your session has expired. Please log in again.';
  }

  if (error.name === 'NetworkError') {
    return 'Network error - please check your connection';
  }

  if ('message' in error) return error.message;

  return 'An unexpected error occurred';
};

// Helper function to check if an error is an API error
export const isApiError = (error: any): boolean => {
  return (
    error &&
    (typeof error === 'object') &&
    ('status' in error || 'name' in error || 'message' in error)
  );
};
