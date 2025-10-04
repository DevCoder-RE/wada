// Secure Logbook Service Tests
// Tests for secure data storage and verification integration

import { SecureLogbookService } from './secure-logbook.service';
import { DatabaseService, AuthService, CertificationService } from './index';

// Mock dependencies
jest.mock('./index', () => ({
  DatabaseService: {
    getLogbookEntries: jest.fn(),
    createLogbookEntry: jest.fn(),
    updateLogbookEntry: jest.fn(),
  },
  AuthService: {
    getCurrentUser: jest.fn(),
  },
  CertificationService: {
    verifyBarcodeWithCertifications: jest.fn(),
  },
}));

// Mock Supabase
jest.mock('./config', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
      rpc: jest.fn(),
    })),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

describe('SecureLogbookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSecureEntry', () => {
    it('should create a secure entry with verification', async () => {
      // Mock authenticated user
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Mock verification
      (
        CertificationService.verifyBarcodeWithCertifications as jest.Mock
      ).mockResolvedValue({
        data: {
          verified: true,
          certifications: [
            {
              id: 'cert-1',
              name: 'NSF Certified',
              issuer: 'NSF International',
              type: 'NSF',
              valid_until: new Date('2025-12-31'),
            },
          ],
        },
      });

      // Mock database insert
      const mockSupabase = require('./config').supabase;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'entry-123',
                athlete_id: 'user-123',
                supplement_id: 'supp-123',
                amount: 100,
                unit: 'mg',
                verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          })),
        })),
      });

      const entryData = {
        athleteId: 'user-123',
        supplementId: 'supp-123',
        amount: 100,
        unit: 'mg' as const,
        notes: 'Test entry',
      };

      const result = await SecureLogbookService.createSecureEntry(entryData, {
        barcode: '123456789',
        verification_method: 'barcode_scan',
      });

      expect(result.data).toBeDefined();
      expect(result.data?.verified).toBe(true);
      expect(result.data?.verification_data?.certifications).toHaveLength(1);
      expect(result.error).toBeUndefined();
    });

    it('should handle authentication failure', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const entryData = {
        athleteId: 'user-123',
        supplementId: 'supp-123',
        amount: 100,
        unit: 'mg' as const,
      };

      const result = await SecureLogbookService.createSecureEntry(entryData);

      expect(result.data).toEqual({});
      expect(result.error).toBe('Authentication required');
    });

    it('should handle insufficient permissions', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-456', // Different user
        email: 'test@example.com',
      });

      const entryData = {
        athleteId: 'user-123', // Trying to create for different athlete
        supplementId: 'supp-123',
        amount: 100,
        unit: 'mg' as const,
      };

      const result = await SecureLogbookService.createSecureEntry(entryData);

      expect(result.data).toEqual({});
      expect(result.error).toContain('Insufficient permissions');
    });
  });

  describe('getSecureEntries', () => {
    it('should retrieve secure entries with decryption', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const mockSupabase = require('./config').supabase;
      const mockData = [
        {
          id: 'entry-123',
          athlete_id: 'user-123',
          supplement_id: 'supp-123',
          amount: 100,
          unit: 'mg',
          verified: true,
          notes: 'VGVzdCBub3Rl', // Base64 encoded "Test note"
          verification_data: 'eyJjZXJ0aWZpY2F0aW9ucyI6W119', // Base64 encoded JSON
          security_metadata: {
            encryption_version: 'secure_logbook_encryption_v1',
            audit_trail: [],
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            })),
          })),
        })),
      });

      const result = await SecureLogbookService.getSecureEntries('user-123');

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].notes).toBe('Test note');
      expect(result.error).toBeUndefined();
    });

    it('should handle database errors', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const mockSupabase = require('./config').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' },
              }),
            })),
          })),
        })),
      });

      const result = await SecureLogbookService.getSecureEntries('user-123');

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('updateSecureEntry', () => {
    it('should update entry with audit trail', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const mockSupabase = require('./config').supabase;

      // Mock existing entry fetch
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              data: {
                id: 'entry-123',
                athlete_id: 'user-123',
                amount: 100,
                unit: 'mg',
                security_metadata: {
                  audit_trail: [],
                },
              },
              error: null,
            }),
          })),
        })
        // Mock update
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'entry-123',
                    amount: 200, // Updated amount
                    security_metadata: {
                      audit_trail: [
                        {
                          action: 'update',
                          user_id: 'user-123',
                          changes: { amount: 200 },
                        },
                      ],
                    },
                  },
                  error: null,
                }),
              })),
            })),
          })),
        });

      const result = await SecureLogbookService.updateSecureEntry('entry-123', {
        amount: 200,
      });

      expect(result.data?.amount).toBe(200);
      expect(result.data?.security_metadata.audit_trail).toHaveLength(1);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getComplianceSummary', () => {
    it('should generate compliance summary with alerts', async () => {
      (AuthService.getCurrentUser as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Mock entries with mixed verification status
      const mockEntries = [
        {
          id: 'entry-1',
          verified: true,
          supplementId: 'supp-1',
          verification_data: {
            certifications: [{ valid_until: new Date('2025-12-31') }],
          },
        },
        {
          id: 'entry-2',
          verified: false,
          supplementId: 'supp-2',
        },
        {
          id: 'entry-3',
          verified: true,
          supplementId: 'supp-1',
          verification_data: {
            certifications: [{ valid_until: new Date('2023-01-01') }], // Expired
          },
        },
      ];

      jest.spyOn(SecureLogbookService, 'getSecureEntries').mockResolvedValue({
        data: mockEntries,
        error: undefined,
      });

      const result =
        await SecureLogbookService.getComplianceSummary('user-123');

      expect(result.data?.metrics.total_entries).toBe(3);
      expect(result.data?.metrics.verified_entries).toBe(2);
      expect(result.data?.metrics.compliance_rate).toBeCloseTo(66.7, 1);
      expect(result.data?.alerts).toHaveLength(2); // One unverified, one expired
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateEntryPermissions', () => {
    it('should allow users to modify their own entries', async () => {
      const mockSupabase = require('./config').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'athlete' },
                error: null,
              }),
            })),
          })),
        })),
      });

      const hasPermission = await (
        SecureLogbookService as any
      ).validateEntryPermissions('user-123', 'user-123');

      expect(hasPermission).toBe(true);
    });

    it('should allow coaches to modify athlete entries', async () => {
      const mockSupabase = require('./config').supabase;
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { role: 'coach' },
                  error: null,
                }),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: { coach_id: 'coach-123', athlete_id: 'athlete-123' },
                  error: null,
                }),
              })),
            })),
          })),
        });

      const hasPermission = await (
        SecureLogbookService as any
      ).validateEntryPermissions('coach-123', 'athlete-123');

      expect(hasPermission).toBe(true);
    });

    it('should deny access for unauthorized users', async () => {
      const mockSupabase = require('./config').supabase;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { role: 'athlete' },
                error: null,
              }),
            })),
          })),
        })),
      });

      const hasPermission = await (
        SecureLogbookService as any
      ).validateEntryPermissions('user-456', 'user-123');

      expect(hasPermission).toBe(false);
    });
  });
});
