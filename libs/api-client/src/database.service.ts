// Database query functions

import { supabase } from './client';
import type {
  AthleteProfile,
  Supplement,
  LogbookEntry,
  ApiResponse,
  UserPreferences,
  Certification,
} from '@wada-bmad/types';

export class DatabaseService {
  static async getAthleteProfile(
    userId: string
  ): Promise<ApiResponse<AthleteProfile>> {
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
        error:
          error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  }

  static async updateAthleteProfile(
    userId: string,
    updates: Partial<AthleteProfile>
  ): Promise<ApiResponse<AthleteProfile>> {
    try {
      const { data, error } = await supabase
        .from('athlete_profiles')
        .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AthleteProfile,
        error:
          error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  }

  static async getSupplements(): Promise<ApiResponse<Supplement[]>> {
    try {
      const { data, error } = await supabase.from('supplements').select(`
          *,
          ingredients (*),
          supplement_certifications (
            certifications (*)
          )
        `);

      if (error) throw error;

      // Transform the data to match our types
      const transformedData =
        data?.map((supplement) => ({
          ...supplement,
          certifications:
            supplement.supplement_certifications?.map(
              (sc: any) => sc.certifications
            ) || [],
        })) || [];

      return { data: transformedData };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch supplements',
      };
    }
  }

  static async verifySupplementByBarcode(
    barcode: string
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc(
        'verify_supplement_by_barcode',
        { barcode_input: barcode }
      );

      if (error) throw error;

      return { data: data?.[0] || null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to verify supplement',
      };
    }
  }

  static async getLogbookEntries(
    athleteId: string,
    limit = 50
  ): Promise<ApiResponse<LogbookEntry[]>> {
    try {
      const { data, error } = await supabase
        .from('logbook_entries')
        .select(
          `
          *,
          supplements (
            id,
            name,
            brand
          )
        `
        )
        .eq('athlete_id', athleteId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch logbook entries',
      };
    }
  }

  static async createLogbookEntry(
    entry: Omit<LogbookEntry, 'id' | 'timestamp' | 'created_at' | 'updated_at'>
  ): Promise<ApiResponse<LogbookEntry>> {
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create logbook entry',
      };
    }
  }

  static async updateLogbookEntry(
    id: string,
    updates: Partial<LogbookEntry>
  ): Promise<ApiResponse<LogbookEntry>> {
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update logbook entry',
      };
    }
  }

  static async getAthleteComplianceSummary(
    athleteId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.rpc(
        'get_athlete_compliance_summary',
        {
          athlete_uuid: athleteId,
          start_date: startDate?.toISOString().split('T')[0],
          end_date: endDate?.toISOString().split('T')[0],
        }
      );

      if (error) throw error;

      return { data: data?.[0] || null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch compliance summary',
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch certifications',
      };
    }
  }

  static async getUserPreferences(
    userId: string
  ): Promise<ApiResponse<UserPreferences>> {
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch user preferences',
      };
    }
  }

  static async updateUserPreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
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
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update user preferences',
      };
    }
  }
}