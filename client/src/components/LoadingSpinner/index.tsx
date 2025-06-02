import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500" />
    </div>
  );
};

export default LoadingSpinner;
