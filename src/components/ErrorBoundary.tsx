import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Something went wrong</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-4 text-red-800 dark:text-red-200 text-sm overflow-auto max-h-[200px]">
              <p className="font-medium">{this.state.error?.message || 'An unexpected error occurred'}</p>
              {this.state.error?.stack && (
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {this.state.error.stack.split('\n').slice(0, 3).join('\n')}
                </pre>
              )}
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reload Page
              </button>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                If the problem persists, try disabling voice synthesis in the settings.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}