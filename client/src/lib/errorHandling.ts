// Custom error handler for API calls
export const handleApiError = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

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
      default:
        return error.data?.message || 'An unexpected error occurred';
    }
  }

  if ('message' in error) return error.message;

  return 'An unexpected error occurred';
};
