import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthGuard from './AuthGuard';
import { AuthService } from '@wada-bmad/api-client';

// Mock AuthService
jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
  },
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner initially', () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByRole('generic', { hidden: true })).toHaveClass(
      'animate-spin'
    );
  });

  it('shows sign in form when not authenticated', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });
  });

  it('shows protected content when authenticated', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('handles sign in successfully', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signIn.mockResolvedValue({
      data: { id: '1', email: 'test@example.com', role: 'athlete' },
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(mockAuthService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });
  });

  it('handles sign in error', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signIn.mockResolvedValue({ error: 'Invalid credentials' });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('switches to sign up mode', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Need an account? Sign up'));

    expect(screen.getByText('Create your account')).toBeInTheDocument();
  });

  it('handles sign up', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.signUp.mockResolvedValue({
      data: { id: '1', email: 'test@example.com', role: 'athlete' },
    });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Need an account? Sign up'));
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByText('Sign up'));

    await waitFor(() => {
      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      );
    });
  });

  it('handles password reset', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    mockAuthService.resetPassword.mockResolvedValue({ data: null });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Forgot password?'));
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText('Send reset email'));

    await waitFor(() => {
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        'test@example.com'
      );
    });
  });

  it('handles sign out', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });
    mockAuthService.signOut.mockResolvedValue({ data: null });

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sign out'));

    await waitFor(() => {
      expect(mockAuthService.signOut).toHaveBeenCalled();
    });
  });
});
