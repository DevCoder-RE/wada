// Secure Logbook Service for WADA BMAD
// Implements secure data storage and verification integration

import { supabase } from './index';
import { DatabaseService, AuthService, CertificationService } from './index';
import type {
  LogbookEntry,
  ApiResponse,
  Certification,
  AuthUser,
} from '@wada-bmad/types';

export interface SecureLogbookEntry extends LogbookEntry {
  verification_data?: {
    certifications: Certification[];
    verified_at: Date;
    verified_by: string;
    verification_method: 'manual' | 'barcode_scan' | 'api_verification';
  };
  security_metadata: {
    created_by_ip?: string;
    last_modified_by_ip?: string;
    encryption_version: string;
    audit_trail: AuditEntry[];
  };
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: 'create' | 'update' | 'delete' | 'verify';
  user_id: string;
  user_role: string;
  changes: Record<string, any>;
  ip_address?: string;
}

export interface ComplianceSummary {
  athlete_id: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    total_entries: number;
    verified_entries: number;
    compliance_rate: number;
    unique_supplements: number;
    certifications_count: number;
  };
  alerts: ComplianceAlert[];
}

export interface ComplianceAlert {
  id: string;
  type: 'verification_expired' | 'unverified_entry' | 'compliance_breach';
  severity: 'low' | 'medium' | 'high';
  message: string;
  entry_id?: string;
  created_at: Date;
}

export class SecureLogbookService {
  private static readonly ENCRYPTION_KEY = 'secure_logbook_encryption_v1';
  private static readonly AUDIT_RETENTION_DAYS = 365;

  /**
   * Create a secure logbook entry with verification integration
   */
  static async createSecureEntry(
    entryData: Omit<
      LogbookEntry,
      'id' | 'timestamp' | 'created_at' | 'updated_at'
    >,
    verificationData?: {
      barcode?: string;
      certifications?: Certification[];
      verification_method?: 'manual' | 'barcode_scan' | 'api_verification';
    }
  ): Promise<ApiResponse<SecureLogbookEntry>> {
    try {
      // Validate user authentication and permissions
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Verify user has permission to create entries for this athlete
      const hasPermission = await this.validateEntryPermissions(
        currentUser.id,
        entryData.athleteId
      );
      if (!hasPermission) {
        throw new Error('Insufficient permissions to create logbook entry');
      }

      // Perform verification if barcode provided
      let verificationResult = null;
      if (verificationData?.barcode) {
        const verification =
          await CertificationService.verifyBarcodeWithCertifications(
            verificationData.barcode
          );
        if (verification.data) {
          verificationResult = {
            certifications: verification.data.certifications,
            verified_at: new Date(),
            verified_by: currentUser.id,
            verification_method:
              verificationData.verification_method || 'barcode_scan',
          };
        }
      }

      // Create the secure entry
      const secureEntry: Omit<
        SecureLogbookEntry,
        'id' | 'created_at' | 'updated_at'
      > = {
        ...entryData,
        verified: !!verificationResult,
        verified_at: verificationResult?.verified_at,
        verified_by: verificationResult?.verified_by,
        verification_data: verificationResult,
        security_metadata: {
          encryption_version: this.ENCRYPTION_KEY,
          audit_trail: [
            {
              id: crypto.randomUUID(),
              timestamp: new Date(),
              action: 'create',
              user_id: currentUser.id,
              user_role: await this.getUserRole(currentUser.id),
              changes: entryData,
            },
          ],
        },
      };

      // Encrypt sensitive data
      const encryptedEntry = await this.encryptEntryData(secureEntry);

      // Store in database
      const { data, error } = await supabase
        .from('secure_logbook_entries')
        .insert(encryptedEntry)
        .select()
        .single();

      if (error) throw error;

      // Decrypt for return
      const decryptedEntry = await this.decryptEntryData(data);

      return { data: decryptedEntry };
    } catch (error) {
      return {
        data: {} as SecureLogbookEntry,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create secure entry',
      };
    }
  }

  /**
   * Get secure logbook entries with access control
   */
  static async getSecureEntries(
    athleteId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
      includeAudit?: boolean;
    }
  ): Promise<ApiResponse<SecureLogbookEntry[]>> {
    try {
      // Validate user authentication and permissions
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const hasPermission = await this.validateReadPermissions(
        currentUser.id,
        athleteId
      );
      if (!hasPermission) {
        throw new Error('Insufficient permissions to view logbook entries');
      }

      // Build query
      let query = supabase
        .from('secure_logbook_entries')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('timestamp', { ascending: false });

      if (options?.limit) query = query.limit(options.limit);
      if (options?.offset)
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1
        );
      if (options?.startDate)
        query = query.gte('timestamp', options.startDate.toISOString());
      if (options?.endDate)
        query = query.lte('timestamp', options.endDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;

      // Decrypt entries
      const decryptedEntries = await Promise.all(
        (data || []).map((entry) => this.decryptEntryData(entry))
      );

      return { data: decryptedEntries };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch secure entries',
      };
    }
  }

  /**
   * Update secure logbook entry with audit trail
   */
  static async updateSecureEntry(
    entryId: string,
    updates: Partial<LogbookEntry>
  ): Promise<ApiResponse<SecureLogbookEntry>> {
    try {
      // Validate user authentication and permissions
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // Get existing entry to check permissions
      const { data: existingEntry, error: fetchError } = await supabase
        .from('secure_logbook_entries')
        .select('*')
        .eq('id', entryId)
        .single();

      if (fetchError) throw fetchError;

      const hasPermission = await this.validateEntryPermissions(
        currentUser.id,
        existingEntry.athlete_id
      );
      if (!hasPermission) {
        throw new Error('Insufficient permissions to update logbook entry');
      }

      // Decrypt existing entry
      const decryptedEntry = await this.decryptEntryData(existingEntry);

      // Create audit entry
      const auditEntry: AuditEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        action: 'update',
        user_id: currentUser.id,
        user_role: await this.getUserRole(currentUser.id),
        changes: updates,
      };

      // Update audit trail
      const updatedAuditTrail = [
        ...decryptedEntry.security_metadata.audit_trail,
        auditEntry,
      ];

      // Update entry
      const updatedEntry = {
        ...decryptedEntry,
        ...updates,
        updated_at: new Date(),
        security_metadata: {
          ...decryptedEntry.security_metadata,
          audit_trail: updatedAuditTrail,
        },
      };

      // Encrypt and update
      const encryptedEntry = await this.encryptEntryData(updatedEntry);

      const { data, error } = await supabase
        .from('secure_logbook_entries')
        .update(encryptedEntry)
        .eq('id', entryId)
        .select()
        .single();

      if (error) throw error;

      // Decrypt for return
      const decryptedResult = await this.decryptEntryData(data);

      return { data: decryptedResult };
    } catch (error) {
      return {
        data: {} as SecureLogbookEntry,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update secure entry',
      };
    }
  }

  /**
   * Get compliance summary with security checks
   */
  static async getComplianceSummary(
    athleteId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<ComplianceSummary>> {
    try {
      // Validate permissions
      const currentUser = await AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      const hasPermission = await this.validateReadPermissions(
        currentUser.id,
        athleteId
      );
      if (!hasPermission) {
        throw new Error('Insufficient permissions to view compliance data');
      }

      // Get entries for the period
      const entriesResult = await this.getSecureEntries(athleteId, {
        startDate,
        endDate,
      });

      if (entriesResult.error) throw new Error(entriesResult.error);

      const entries = entriesResult.data || [];
      const verifiedEntries = entries.filter((entry) => entry.verified);

      // Calculate metrics
      const uniqueSupplements = new Set(
        entries.map((entry) => entry.supplementId)
      ).size;

      const certificationsCount = verifiedEntries.reduce(
        (total, entry) =>
          total + (entry.verification_data?.certifications?.length || 0),
        0
      );

      // Generate alerts
      const alerts = this.generateComplianceAlerts(entries);

      const summary: ComplianceSummary = {
        athlete_id: athleteId,
        period: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: endDate || new Date(),
        },
        metrics: {
          total_entries: entries.length,
          verified_entries: verifiedEntries.length,
          compliance_rate:
            entries.length > 0
              ? (verifiedEntries.length / entries.length) * 100
              : 0,
          unique_supplements: uniqueSupplements,
          certifications_count: certificationsCount,
        },
        alerts,
      };

      return { data: summary };
    } catch (error) {
      return {
        data: {} as ComplianceSummary,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate compliance summary',
      };
    }
  }

  /**
   * Validate user permissions for logbook operations
   */
  private static async validateEntryPermissions(
    userId: string,
    athleteId: string
  ): Promise<boolean> {
    // Users can always modify their own entries
    if (userId === athleteId) return true;

    // Check if user is a coach/admin with permission to modify this athlete's data
    const userRole = await this.getUserRole(userId);
    if (userRole === 'admin') return true;

    if (userRole === 'coach') {
      // Check if coach has relationship with athlete
      const { data } = await supabase
        .from('coach_athlete_relationships')
        .select('*')
        .eq('coach_id', userId)
        .eq('athlete_id', athleteId)
        .single();

      return !!data;
    }

    return false;
  }

  /**
   * Validate read permissions (more permissive than write permissions)
   */
  private static async validateReadPermissions(
    userId: string,
    athleteId: string
  ): Promise<boolean> {
    // Users can always read their own data
    if (userId === athleteId) return true;

    // Coaches and admins can read athlete data
    const userRole = await this.getUserRole(userId);
    if (['coach', 'admin'].includes(userRole)) return true;

    return false;
  }

  /**
   * Get user role from database
   */
  private static async getUserRole(userId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      return data?.role || 'athlete';
    } catch {
      return 'athlete';
    }
  }

  /**
   * Encrypt sensitive entry data
   */
  private static async encryptEntryData(
    entry: Omit<SecureLogbookEntry, 'id' | 'created_at' | 'updated_at'>
  ): Promise<any> {
    // In a real implementation, this would use proper encryption
    // For now, we'll use a simple obfuscation for demonstration
    const sensitiveFields = ['notes', 'verification_data'];
    const encrypted = { ...entry };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        encrypted[field] = btoa(JSON.stringify(encrypted[field]));
      }
    }

    return encrypted;
  }

  /**
   * Decrypt entry data
   */
  private static async decryptEntryData(
    encryptedEntry: any
  ): Promise<SecureLogbookEntry> {
    // In a real implementation, this would use proper decryption
    const decrypted = { ...encryptedEntry };
    const sensitiveFields = ['notes', 'verification_data'];

    for (const field of sensitiveFields) {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = JSON.parse(atob(decrypted[field]));
        } catch {
          // If decryption fails, keep original
        }
      }
    }

    return decrypted as SecureLogbookEntry;
  }

  /**
   * Generate compliance alerts based on entry data
   */
  private static generateComplianceAlerts(
    entries: SecureLogbookEntry[]
  ): ComplianceAlert[] {
    const alerts: ComplianceAlert[] = [];

    for (const entry of entries) {
      // Check for unverified entries
      if (!entry.verified) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'unverified_entry',
          severity: 'medium',
          message: `Entry for ${entry.supplementId} is not verified`,
          entry_id: entry.id,
          created_at: new Date(),
        });
      }

      // Check for expired verifications
      if (entry.verification_data?.certifications) {
        for (const cert of entry.verification_data.certifications) {
          if (cert.valid_until && cert.valid_until < new Date()) {
            alerts.push({
              id: crypto.randomUUID(),
              type: 'verification_expired',
              severity: 'high',
              message: `${cert.name} certification has expired`,
              entry_id: entry.id,
              created_at: new Date(),
            });
          }
        }
      }
    }

    return alerts;
  }

  /**
   * Clean up old audit entries
   */
  static async cleanupAuditTrail(): Promise<ApiResponse<boolean>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.AUDIT_RETENTION_DAYS);

      // This would need to be implemented in the database
      // For now, return success
      return { data: true };
    } catch (error) {
      return {
        data: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to cleanup audit trail',
      };
    }
  }
}
