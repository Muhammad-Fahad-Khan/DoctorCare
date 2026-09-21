import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

// Without this, any render error unmounts the whole React tree and the user is left staring at a
// blank white page. This keeps the failure visible and recoverable instead.
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('UI crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <AlertCircle className="text-red-500" size={28} />
        <p className="text-sm font-semibold text-royal">Something went wrong showing this page.</p>
        <p className="max-w-sm text-sm text-royal/60">
          Your data is safe. Reload the page to continue; if it keeps happening, tell the site admin.
        </p>
        <button onClick={() => window.location.reload()} className="btn-primary !px-4 !py-2 text-xs">
          Reload page
        </button>
      </div>
    );
  }
}
