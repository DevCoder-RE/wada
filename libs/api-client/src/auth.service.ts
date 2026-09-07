// Authentication methods

import { supabase } from './client';
import type { User } from '@supabase/supabase-js';
import type { ApiResponse, AuthUser } from '@wada-bmad/types';

export class AuthService {
  static async signUp(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return {
        data: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: 'athlete', // Default role
        },
      };
    } catch (error) {
      return {
        data: {} as AuthUser,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  static async signIn(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        data: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: 'athlete',
        },
      };
    } catch (error) {
      return {
        data: {} as AuthUser,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  static async signOut(): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      return { data: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }

  static async resetPassword(email: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      return { data: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Reset failed',
      };
    }
  }
}