"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, RefreshCw, MessageSquare } from "lucide-react";

interface MessagingErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface MessagingErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class MessagingErrorBoundary extends React.Component<
  MessagingErrorBoundaryProps,
  MessagingErrorBoundaryState
> {
  constructor(props: MessagingErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<MessagingErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MessagingErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Messaging error in production:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;
      
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return <MessagingErrorFallback error={this.state.error} retry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface MessagingErrorFallbackProps {
  error: Error | null;
  retry: () => void;
}

export function MessagingErrorFallback({ error, retry }: MessagingErrorFallbackProps) {
  const isNetworkError = error?.message.includes('fetch') || error?.message.includes('network');
  const isSocketError = error?.message.includes('socket') || error?.message.includes('connection');

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Messaging Error
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-destructive" />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">
              {isNetworkError ? 'Connection Problem' : 
               isSocketError ? 'Real-time Connection Failed' : 
               'Something went wrong'}
            </h2>
            
            <p className="text-muted-foreground mb-4">
              {isNetworkError ? 
                'Unable to connect to messaging server. Please check your internet connection.' :
               isSocketError ?
                'Real-time messaging is temporarily unavailable. You can still send messages.' :
                'An unexpected error occurred while loading messages.'}
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left bg-muted rounded p-3 text-sm mb-4">
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap overflow-auto">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}
          </div>
          
          <div className="space-y-2">
            <Button onClick={retry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for functional components to handle errors gracefully
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    console.error('Messaging error:', errorObj);
    setError(errorObj);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const retryWithErrorHandling = React.useCallback(async (
    operation: () => Promise<void>,
    context?: string
  ) => {
    try {
      clearError();
      await operation();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (context) {
        error.message = `${context}: ${error.message}`;
      }
      handleError(error);
    }
  }, [handleError, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryWithErrorHandling,
  };
} 