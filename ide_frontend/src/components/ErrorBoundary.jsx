import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
          <div className="max-w-3xl w-full rounded-3xl border border-red-600 bg-red-950/30 p-8">
            <h1 className="text-2xl font-bold text-red-300 mb-4">Something went wrong</h1>
            <p className="text-slate-200 mb-4">A problem prevented the page from loading correctly.</p>
            <pre className="text-xs text-slate-100 bg-slate-800 rounded-lg p-3 overflow-x-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
            <pre className="text-xs text-slate-300 mt-2 whitespace-pre-wrap">
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
