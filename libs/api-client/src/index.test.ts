import { AuthService } from './index';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  })),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up a user successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      });

      const result = await AuthService.signUp('test@example.com', 'password');

      expect(result.data).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'athlete',
      });
      expect(result.error).toBeUndefined();
    });

    it('should handle sign up error', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Sign up failed' },
      });

      const result = await AuthService.signUp('test@example.com', 'password');

      expect(result.data).toEqual({});
      expect(result.error).toBe('Sign up failed');
    });
  });

  describe('signIn', () => {
    it('should sign in a user successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null,
      });

      const result = await AuthService.signIn('test@example.com', 'password');

      expect(result.data).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'athlete',
      });
      expect(result.error).toBeUndefined();
    });

    it('should handle sign in error', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Sign in failed' },
      });

      const result = await AuthService.signIn('test@example.com', 'password');

      expect(result.data).toEqual({});
      expect(result.error).toBe('Sign in failed');
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await AuthService.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should handle sign out error', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { message: 'Sign out failed' },
      });

      const result = await AuthService.signOut();

      expect(result.data).toBeNull();
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
      });

      const user = await AuthService.getCurrentUser();

      expect(user).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('should return null if no user', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const user = await AuthService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('should handle reset password error', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Reset failed' },
      });

      const result = await AuthService.resetPassword('test@example.com');

      expect(result.data).toBeNull();
      expect(result.error).toBe('Reset failed');
    });
  });
});
