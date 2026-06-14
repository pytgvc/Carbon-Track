import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('carbon_tracker_user_profile');
    localStorage.removeItem('carbon_tracker_committed_actions');
    localStorage.removeItem('carbon_tracker_daily_logs');
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg)',
            padding: '24px',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <div 
            className="card" 
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              padding: '40px'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h1 style={{ fontSize: '1.6rem', color: 'var(--primary-dark)', margin: 0 }}>
              Oops! Something went wrong
            </h1>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              The application encountered an unexpected error. Don't worry, your data is safe, but we might need to reset the application state.
            </p>

            {this.state.error && (
              <pre style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--secondary-bg)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                textAlign: 'left',
                overflowX: 'auto',
                color: 'var(--danger)'
              }}>
                {this.state.error.message}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} />
              <span>Reset & Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
