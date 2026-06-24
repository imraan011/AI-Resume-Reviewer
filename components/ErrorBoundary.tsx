'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Agli render me fallback UI dikhane ke liye state update karein
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Yahan console pe error log kar rahe hain
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    // Page reload karke error state clear karein
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-8 space-y-6 shadow-2xl">
            {/* Error indicator strip */}
            <div className="w-12 h-1 bg-[var(--danger)] rounded-full mx-auto" />
            
            <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
              Something went wrong
            </h2>
            
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              An unexpected error occurred while loading or processing the page.
            </p>

            {isDev && this.state.error && (
              <div className="bg-neutral-900 border border-red-900/30 rounded p-4 text-left font-mono text-xs text-red-400 max-h-40 overflow-auto break-all">
                <p className="font-bold mb-1">Dev Error Info:</p>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-[var(--accent)] hover:brightness-110 active:scale-98 transition-all font-display font-bold text-xs uppercase tracking-wider rounded-[4px] text-white cursor-pointer shadow-[0_2px_10px_var(--accent-glow)]"
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-2.5 border border-[var(--border-subtle)] hover:border-white/40 bg-transparent active:scale-98 transition-all font-display font-bold text-xs uppercase tracking-wider rounded-[4px] text-white cursor-pointer"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
