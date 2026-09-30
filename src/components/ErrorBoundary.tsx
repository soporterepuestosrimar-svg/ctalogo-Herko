import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    // Clear potential corrupted local session flags safely and reload
    try {
      window.location.reload();
    } catch {
      window.location.href = window.location.pathname;
    }
  };

  private handleResetToHome = () => {
    try {
      window.location.href = window.location.pathname;
    } catch {
      this.setState({ hasError: false, error: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {this.props.fallbackTitle || 'Ocurrió un inconveniente temporal'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                La aplicación de Repuestos Rimar recuperó el estado de manera segura. Puedes recargar la página o volver al catálogo principal.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-red-400 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar Catálogo</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetToHome}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
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
