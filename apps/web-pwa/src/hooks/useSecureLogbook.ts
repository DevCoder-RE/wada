import { useState, useEffect, useCallback } from 'react';
import {
  SecureLogbookService,
  SecureLogbookEntry,
  ComplianceSummary,
  CertificationService,
} from '@wada-bmad/api-client';
import { DatabaseService, AuthService } from '@wada-bmad/api-client';
import type { Supplement, LogbookEntry } from '@wada-bmad/types';

interface UseSecureLogbookOptions {
  athleteId?: string;
  autoLoad?: boolean;
  includeAuditTrail?: boolean;
}

interface UseSecureLogbookReturn {
  entries: SecureLogbookEntry[];
  supplements: Supplement[];
  complianceSummary: ComplianceSummary | null;
  loading: boolean;
  error: string | null;
  createEntry: (
    entryData: Omit<
      LogbookEntry,
      'id' | 'timestamp' | 'created_at' | 'updated_at'
    >
  ) => Promise<void>;
  updateEntry: (
    entryId: string,
    updates: Partial<LogbookEntry>
  ) => Promise<void>;
  deleteEntry: (entryId: string) => Promise<void>;
  verifyEntry: (entryId: string, barcode: string) => Promise<void>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export const useSecureLogbook = (
  options: UseSecureLogbookOptions = {}
): UseSecureLogbookReturn => {
  const [entries, setEntries] = useState<SecureLogbookEntry[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [complianceSummary, setComplianceSummary] =
    useState<ComplianceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user if athleteId not provided
      let targetAthleteId = options.athleteId;
      if (!targetAthleteId) {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          targetAthleteId = currentUser.id;
        } else {
          throw new Error('No athlete ID provided and user not authenticated');
        }
      }

      // Load entries and supplements in parallel
      const [entriesResult, supplementsResult, complianceResult] =
        await Promise.all([
          SecureLogbookService.getSecureEntries(targetAthleteId, {
            includeAudit: options.includeAuditTrail,
          }),
          DatabaseService.getSupplements(),
          SecureLogbookService.getComplianceSummary(targetAthleteId),
        ]);

      if (entriesResult.error) throw new Error(entriesResult.error);
      if (supplementsResult.error) throw new Error(supplementsResult.error);
      if (complianceResult.error) throw new Error(complianceResult.error);

      setEntries(entriesResult.data || []);
      setSupplements(supplementsResult.data || []);
      setComplianceSummary(complianceResult.data || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load logbook data'
      );
    } finally {
      setLoading(false);
    }
  }, [options.athleteId, options.includeAuditTrail]);

  const createEntry = useCallback(
    async (
      entryData: Omit<
        LogbookEntry,
        'id' | 'timestamp' | 'created_at' | 'updated_at'
      >
    ) => {
      try {
        setError(null);

        // Check if we should attempt verification
        const supplement = supplements.find(
          (s) => s.id === entryData.supplementId
        );
        let verificationData = undefined;

        if (supplement?.barcode) {
          // Attempt automatic verification if barcode is available
          const verification =
            await CertificationService.verifyBarcodeWithCertifications(
              supplement.barcode
            );
          if (verification.data) {
            verificationData = {
              barcode: supplement.barcode,
              certifications: verification.data.certifications,
              verification_method: 'api_verification' as const,
            };
          }
        }

        const result = await SecureLogbookService.createSecureEntry(
          entryData,
          verificationData
        );

        if (result.error) throw new Error(result.error);

        // Refresh data to show the new entry
        await loadData();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create entry');
      }
    },
    [supplements, loadData]
  );

  const updateEntry = useCallback(
    async (entryId: string, updates: Partial<LogbookEntry>) => {
      try {
        setError(null);

        const result = await SecureLogbookService.updateSecureEntry(
          entryId,
          updates
        );

        if (result.error) throw new Error(result.error);

        // Update local state optimistically
        setEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.id === entryId ? { ...entry, ...result.data } : entry
          )
        );

        // Refresh compliance summary
        if (options.athleteId) {
          const complianceResult =
            await SecureLogbookService.getComplianceSummary(options.athleteId);
          if (!complianceResult.error) {
            setComplianceSummary(complianceResult.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update entry');
        // Revert optimistic update on error
        await loadData();
      }
    },
    [options.athleteId, loadData]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      try {
        setError(null);

        // Note: In a real implementation, you'd have a delete method in SecureLogbookService
        // For now, we'll use the existing DatabaseService method
        const result = await DatabaseService.updateLogbookEntry(entryId, {
          // Mark as deleted instead of actually deleting for audit purposes
          notes:
            '[DELETED] ' + (entries.find((e) => e.id === entryId)?.notes || ''),
        } as any);

        if (result.error) throw new Error(result.error);

        // Remove from local state
        setEntries((prevEntries) =>
          prevEntries.filter((entry) => entry.id !== entryId)
        );

        // Refresh compliance summary
        if (options.athleteId) {
          const complianceResult =
            await SecureLogbookService.getComplianceSummary(options.athleteId);
          if (!complianceResult.error) {
            setComplianceSummary(complianceResult.data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete entry');
      }
    },
    [entries, options.athleteId]
  );

  const verifyEntry = useCallback(
    async (entryId: string, barcode: string) => {
      try {
        setError(null);

        // Verify the barcode
        const verification =
          await CertificationService.verifyBarcodeWithCertifications(barcode);

        if (verification.error) throw new Error(verification.error);

        if (verification.data) {
          // Update the entry with verification data
          const verificationData = {
            certifications: verification.data.certifications,
            verified_at: new Date(),
            verification_method: 'barcode_scan' as const,
          };

          const result = await SecureLogbookService.updateSecureEntry(entryId, {
            verified: true,
            verified_at: verificationData.verified_at,
            verification_data: verificationData,
          } as any);

          if (result.error) throw new Error(result.error);

          // Update local state
          setEntries((prevEntries) =>
            prevEntries.map((entry) =>
              entry.id === entryId ? { ...entry, ...result.data } : entry
            )
          );

          // Refresh compliance summary
          if (options.athleteId) {
            const complianceResult =
              await SecureLogbookService.getComplianceSummary(
                options.athleteId
              );
            if (!complianceResult.error) {
              setComplianceSummary(complianceResult.data);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to verify entry');
      }
    },
    [options.athleteId]
  );

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Auto-load data on mount if requested
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadData();
    }
  }, [loadData, options.autoLoad]);

  return {
    entries,
    supplements,
    complianceSummary,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    verifyEntry,
    refreshData,
    clearError,
  };
};
