// Shared API client for Supabase integration

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AthleteProfile,
  Supplement,
  LogbookEntry,
  TrackingData,
  ApiResponse,
  AuthUser,
  UserPreferences,
  Certification
} from '@wada-bmad/types';
import { supabaseConfig, realtimeConfig, apiConfig } from './config';

// Create Supabase client with configuration
export const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: realtimeConfig,
    global: {
      headers: {
        'X-Client-Info': 'wada-bmad-api-client',
      },
    },
  }
);

// Authentication methods
export class AuthService {
  static async signUp(email: string, password: string): Promise<ApiResponse<AuthUser>> {
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

  static async signIn(email: string, password: string): Promise<ApiResponse<AuthUser>> {
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
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
}

// Database query functions
export class DatabaseService {
  static async getAthleteProfile(userId: string): Promise<ApiResponse<AthleteProfile>> {
    try {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AthleteProfile,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  static async updateAthleteProfile(userId: string, updates: Partial<AthleteProfile>): Promise<ApiResponse<AthleteProfile>> {
    try {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AthleteProfile,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  static async getSupplements(): Promise<ApiResponse<Supplement[]>> {
    try {
      const { data, error } = await supabase
        .from('supplements')
        .select(`
          *,
          ingredients (*),
          supplement_certifications (
            certifications (*)
          )
        `);

      if (error) throw error;

      // Transform the data to match our types
      const transformedData = data?.map(supplement => ({
        ...supplement,
        certifications: supplement.supplement_certifications?.map((sc: any) => sc.certifications) || []
      })) || [];

      return { data: transformedData };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch supplements',
      };
    }
  }

  static async verifySupplementByBarcode(barcode: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('verify_supplement_by_barcode', { barcode_input: barcode });

      if (error) throw error;

      return { data: data?.[0] || null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to verify supplement',
      };
    }
  }

  static async getLogbookEntries(athleteId: string, limit = 50): Promise<ApiResponse<LogbookEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select(`
          *,
          supplements (
            id,
            name,
            brand
          )
        `)
        .eq('athlete_id', athleteId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch logbook entries',
      };
    }
  }

  static async createLogbookEntry(entry: Omit<LogbookEntry, 'id' | 'timestamp' | 'created_at' | 'updated_at'>): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .insert({
          ...entry,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as LogbookEntry,
        error: error instanceof Error ? error.message : 'Failed to create logbook entry',
      };
    }
  }

  static async updateLogbookEntry(id: string, updates: Partial<LogbookEntry>): Promise<ApiResponse<LogbookEntry>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as LogbookEntry,
        error: error instanceof Error ? error.message : 'Failed to update logbook entry',
      };
    }
  }

  static async getAthleteComplianceSummary(
    athleteId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .rpc('get_athlete_compliance_summary', {
          athlete_uuid: athleteId,
          start_date: startDate?.toISOString().split('T')[0],
          end_date: endDate?.toISOString().split('T')[0]
        });

      if (error) throw error;

      return { data: data?.[0] || null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch compliance summary',
      };
    }
  }

  static async getCertifications(): Promise<ApiResponse<Certification[]>> {
    try {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .order('name');

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch certifications',
      };
    }
  }

  static async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as UserPreferences,
        error: error instanceof Error ? error.message : 'Failed to fetch user preferences',
      };
    }
  }

  static async updateUserPreferences(userId: string, updates: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as UserPreferences,
        error: error instanceof Error ? error.message : 'Failed to update user preferences',
      };
    }
  }
}

// Real-time subscriptions
export class RealtimeService {
  static subscribeToLogbookUpdates(
    athleteId: string,
    callback: (payload: any) => void
  ): () => void {
    const channel = supabase
      .channel('logbook_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logbook_entries',
          filter: `athleteId=eq.${athleteId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Error handling utilities
export class ErrorHandler {
  static handleApiError(error: any): string {
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    if (typeof error === 'string') return error;
    return 'An unexpected error occurred';
  }

  static isNetworkError(error: any): boolean {
    return error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR';
  }

  static isAuthError(error: any): boolean {
    return error?.status === 401 || error?.message?.includes('JWT');
  }
}