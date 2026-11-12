import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error:", error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            An unexpected error occurred while rendering this page. You can try
            reloading or return to the home page.
          </p>
          {import.meta.env.DEV && this.state.error ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-left text-xs text-red-600">
              {String(this.state.error?.message || this.state.error)}
            </pre>
          ) : null}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.handleHome}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}