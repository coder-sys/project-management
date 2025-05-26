'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center p-5">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex flex-col items-center">
              <h2 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-200">
                Something went wrong
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
