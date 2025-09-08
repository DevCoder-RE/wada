import { useEffect, useState, useCallback } from 'react';
import { AuthService } from '@wada-bmad/api-client';

interface AuthGuardProps {
  children: React.ReactNode;
}

type AuthMode = 'signin' | 'signup' | 'reset';

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Session timeout (30 minutes of inactivity)
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setError('Failed to verify authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Activity tracking for session timeout
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => setLastActivity(Date.now());

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];
    events.forEach((event) => document.addEventListener(event, updateActivity));

    const checkSessionTimeout = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        handleSignOut();
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, updateActivity)
      );
      clearInterval(interval);
    };
  }, [isAuthenticated, lastActivity]);

  const handleSignIn = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      setError('');
      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      try {
        const result = await AuthService.signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setError('An unexpected error occurred during sign in');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const handleSignUp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      setError('');
      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      try {
        const result = await AuthService.signUp(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          setError('Check your email for confirmation link');
        }
      } catch (error) {
        setError('An unexpected error occurred during sign up');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      setError('');
      setIsSubmitting(true);

      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;

      try {
        const result = await AuthService.resetPassword(email);
        if (result.error) {
          setError(result.error);
        } else {
          setError('Password reset email sent');
        }
      } catch (error) {
        setError('An unexpected error occurred during password reset');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await AuthService.signOut();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Sign out failed:', error);
      setError('Failed to sign out');
    }
  }, []);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"
          aria-hidden="true"
        ></div>
        <span className="sr-only">Loading authentication status...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {mode === 'signin'
                ? 'Sign in to your account'
                : mode === 'signup'
                  ? 'Create your account'
                  : 'Reset your password'}
            </h1>
          </div>
          {error && (
            <div
              id="auth-error"
              className="text-red-500 text-center"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          <form
            className="mt-8 space-y-6"
            onSubmit={
              mode === 'signin'
                ? handleSignIn
                : mode === 'signup'
                  ? handleSignUp
                  : handleResetPassword
            }
            aria-labelledby="auth-form-title"
          >
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-describedby={error ? 'auth-error' : undefined}
                  aria-invalid={!!error}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              {mode !== 'reset' && (
                <div>
                  <label htmlFor="password" className="sr-only">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    required
                    minLength={12}
                    aria-describedby={error ? 'auth-error' : undefined}
                    aria-invalid={!!error}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Password (minimum 12 characters)"
                  />
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-describedby={error ? 'auth-error' : undefined}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                      aria-hidden="true"
                    ></div>
                    Processing...
                  </>
                ) : mode === 'signin' ? (
                  'Sign in'
                ) : mode === 'signup' ? (
                  'Sign up'
                ) : (
                  'Send reset email'
                )}
              </button>
            </div>
          </form>
          <div className="text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => setMode('signup')}
                  className="text-blue-600 hover:text-blue-500 block w-full"
                  type="button"
                >
                  Need an account? Sign up
                </button>
                <button
                  onClick={() => setMode('reset')}
                  className="text-blue-600 hover:text-blue-500 block w-full"
                  type="button"
                >
                  Forgot password?
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-500 block w-full"
                type="button"
              >
                Already have an account? Sign in
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => setMode('signin')}
                className="text-blue-600 hover:text-blue-500 block w-full"
                type="button"
              >
                Back to sign in
              </button>
            )}
            <div className="text-xs text-gray-500 mt-4">
              By signing in, you agree to our{' '}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>{' '}
              and{' '}
              <a
                href="/terms-of-service"
                className="text-blue-600 hover:text-blue-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-lg font-semibold text-gray-900">WADA BMAD</h1>
            <button
              onClick={handleSignOut}
              className="text-blue-600 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Sign out of your account"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main role="main">{children}</main>
    </div>
  );
};

export default AuthGuard;
