import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

// Error boundaries have no hook equivalent — this must stay a class component.
//
// Deploys ship a new build hash; a tab left open across a deploy will try to
// fetch a lazy chunk that no longer exists on the server and throw a dynamic
// import error. That's the one failure mode worth auto-recovering from (a
// single reload fetches the current build); everything else just gets a
// fallback screen instead of a blank white page.
const CHUNK_ERROR_PATTERN = /dynamically imported module|Loading chunk|Importing a module script failed/i;
const RELOAD_FLAG = 'b-mori-chunk-reload';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);

    if (CHUNK_ERROR_PATTERN.test(error?.message ?? '') && !sessionStorage.getItem(RELOAD_FLAG)) {
      sessionStorage.setItem(RELOAD_FLAG, '1');
      window.location.reload();
    }
  }

  handleReload = () => {
    sessionStorage.removeItem(RELOAD_FLAG);
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-red-bg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red" />
          </div>
          <h1 className="text-lg font-bold text-text-1 mb-1.5">Algo salió mal</h1>
          <p className="text-sm text-text-4 mb-5">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <button
            onClick={this.handleReload}
            className="w-full py-2.5 rounded-xl bg-orange text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
