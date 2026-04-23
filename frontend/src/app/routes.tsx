import { createBrowserRouter, Outlet, useRouteError } from 'react-router';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SignUp } from './pages/SignUp';
import { ForgotPassword } from './pages/ForgotPassword';
import { Component as ReactComponent, ReactNode, ErrorInfo } from 'react';

// Error boundary class component for catching React errors
class ErrorBoundaryClass extends ReactComponent<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#141414',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          textAlign: 'center',
          padding: 20,
        }}>
          <div>
            <h1 style={{ color: '#E50914', marginBottom: 16 }}>Temporary Error</h1>
            <p style={{ color: '#888', marginBottom: 8 }}>
              {this.state.error?.message || 'An error occurred'}
            </p>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 16 }}>
              This usually happens during hot reload in development. Refreshing will fix it.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: 20,
                padding: '10px 20px',
                background: '#E50914',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Root layout component - now just provides error boundary
function RootLayout() {
  return (
    <ErrorBoundaryClass>
      <Outlet />
    </ErrorBoundaryClass>
  );
}

// Error boundary fallback for router errors
function ErrorBoundary() {
  const error = useRouteError() as Error;
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#141414',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      textAlign: 'center',
      padding: 20,
    }}>
      <div>
        <h1 style={{ color: '#E50914', marginBottom: 16 }}>Oops! Something went wrong</h1>
        <p style={{ color: '#888', marginBottom: 8 }}>
          {error?.message || 'An unexpected error occurred'}
        </p>
        {error?.message?.includes('AppProvider') && (
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 16 }}>
            This is likely a temporary issue during hot reload. Refreshing should fix it.
          </p>
        )}
        <button
          onClick={() => window.location.href = '/'}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            background: '#E50914',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary,
    children: [
      {
        index: true,
        Component: Welcome,
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'signup',
        Component: SignUp,
      },
      {
        path: 'forgot-password',
        Component: ForgotPassword,
      },
      {
        path: '*',
        Component: Login,
      },
    ],
  },
]);