import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<unknown>, State> {
  constructor(props: React.PropsWithChildren<unknown>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Unhandled React error:', error, info);
    // Optionally report to an analytics service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-xl w-full text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-muted-foreground mb-4">An unexpected error occurred. We logged the error to the console for debugging.</p>
            <pre className="text-xs whitespace-pre-wrap text-left bg-card p-4 rounded mb-4 max-h-48 overflow-auto">{String(this.state.error)}</pre>
            <div className="flex gap-2 justify-center">
              <button
                className="px-4 py-2 rounded bg-primary text-white"
                onClick={() => window.location.reload()}
              >
                Reload
              </button>
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  // Try to open devtools hint
                  alert('Open DevTools (F12) and check the Console for the full stack trace.');
                }}
              >
                Open DevTools
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
