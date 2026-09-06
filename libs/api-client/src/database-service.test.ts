import { DatabaseService } from './index';
import { supabase } from './index';

// Mock supabase client
jest.mock('./index', () => {
  const mockSupabaseClient = {
    from: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    })),
    removeChannel: jest.fn(),
  };

  return {
    supabase: mockSupabaseClient,
    DatabaseService: {
      getAthleteProfile: jest.fn(),
      updateAthleteProfile: jest.fn(),
      getSupplements: jest.fn(),
      verifySupplementByBarcode: jest.fn(),
      getLogbookEntries: jest.fn(),
      createLogbookEntry: jest.fn(),
      updateLogbookEntry: jest.fn(),
      getAthleteComplianceSummary: jest.fn(),
      getCertifications: jest.fn(),
      getUserPreferences: jest.fn(),
      updateUserPreferences: jest.fn(),
    },
  };
});

describe('DatabaseService', () => {
  const mockFrom = supabase.from as jest.Mock;
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue(mockQueryBuilder);
  });

  describe('getAthleteProfile', () => {
    it('should return profile data successfully', async () => {
      const mockProfile = {
        id: 'profile-1',
        user_id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        sport: 'Swimming',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const result = await DatabaseService.getAthleteProfile('user-1');

      expect(result.data).toEqual(mockProfile);
      expect(result.error).toBeUndefined();
      expect(mockFrom).toHaveBeenCalledWith('athlete_profiles');
    });

    it('should handle errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: 'Not found',
      });

      const result = await DatabaseService.getAthleteProfile('invalid-user');

      expect(result.error).toBe('Not found');
    });
  });

  describe('updateAthleteProfile', () => {
    it('should update profile successfully', async () => {
      const mockUpdatedProfile = {
        id: 'profile-1',
        user_id: 'user-1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        sport: 'Running',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockQueryBuilder.single.mockResolvedValue({
        data: mockUpdatedProfile,
        error: null,
      });

      const result = await DatabaseService.updateAthleteProfile('user-1', {
        name: 'Jane Doe',
        sport: 'Running',
      });

      expect(result.data).toEqual(mockUpdatedProfile);
      expect(result.error).toBeUndefined();
    });

    it('should handle update errors', async () => {
      mockQueryBuilder.single.mockResolvedValue({
        data: null,
        error: 'Update failed',
      });

      const result = await DatabaseService.updateAthleteProfile('user-1', {
        name: 'Test',
      });

      expect(result.error).toBe('Update failed');
    });
  });

  describe('getSupplements', () => {
    it('should return supplements list', async () => {
      const mockSupplements = [
        {
          id: 'supp-1',
          name: 'Whey Protein',
          brand: 'Optimum Nutrition',
          ingredients: [],
          supplement_certifications: [],
        },
      ];

      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.limit?.mockReturnThis?.();
      mockQueryBuilder.order?.mockReturnThis?.();
      mockQueryBuilder.select.mockResolvedValue({
        data: mockSupplements,
        error: null,
      });

      // Re-setup mock for this specific test
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: mockSupplements, error: null }),
      });

      const result = await DatabaseService.getSupplements();

      expect(result.data).toBeDefined();
    });

    it('should handle errors', async () => {
      mockFrom.mockReturnValue({
        select: jest
          .fn()
          .mockResolvedValue({ data: null, error: 'Database error' }),
      });

      const result = await DatabaseService.getSupplements();

      expect(result.error).toBeDefined();
    });
  });

  describe('verifySupplementByBarcode', () => {
    it('should verify supplement by barcode using RPC', async () => {
      const mockSupplement = {
        name: 'Creatine',
        brand: 'MuscleTech',
      };

      mockFrom.mockReturnValue({
        rpc: jest
          .fn()
          .mockResolvedValue({ data: [mockSupplement], error: null }),
      });

      const result =
        await DatabaseService.verifySupplementByBarcode('123456789');

      expect(result.data).toEqual(mockSupplement);
      expect(mockFrom).toHaveBeenCalledWith('supplements');
    });

    it('should return null for unknown barcode', async () => {
      mockFrom.mockReturnValue({
        rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await DatabaseService.verifySupplementByBarcode('unknown');

      expect(result.data).toBeNull();
    });
  });

  describe('getLogbookEntries', () => {
    it('should return logbook entries for athlete', async () => {
      const mockEntries = [
        {
          id: 'entry-1',
          athlete_id: 'user-1',
          supplement_id: 'supp-1',
          amount: 25,
          unit: 'g',
          timestamp: new Date(),
          verified: true,
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockEntries, error: null }),
      });

      const result = await DatabaseService.getLogbookEntries('user-1');

      expect(result.data).toEqual(mockEntries);
    });

    it('should handle empty entries', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

      const result = await DatabaseService.getLogbookEntries('user-1');

      expect(result.data).toEqual([]);
    });
  });

  describe('createLogbookEntry', () => {
    it('should create logbook entry successfully', async () => {
      const mockEntry = {
        id: 'entry-new',
        athlete_id: 'user-1',
        supplement_id: 'supp-1',
        amount: 30,
        unit: 'mg',
        timestamp: new Date(),
        verified: false,
      };

      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockEntry, error: null }),
      });

      const result = await DatabaseService.createLogbookEntry({
        athleteId: 'user-1',
        supplementId: 'supp-1',
        amount: 30,
        unit: 'mg',
        verified: false,
      });

      expect(result.data).toEqual(mockEntry);
    });

    it('should handle create errors', async () => {
      mockFrom.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: null, error: 'Insert failed' }),
      });

      const result = await DatabaseService.createLogbookEntry({
        athleteId: 'user-1',
        supplementId: 'supp-1',
        amount: 30,
        unit: 'mg',
        verified: false,
      });

      expect(result.error).toBe('Insert failed');
    });
  });

  describe('updateLogbookEntry', () => {
    it('should update logbook entry successfully', async () => {
      const mockUpdatedEntry = {
        id: 'entry-1',
        amount: 50,
        unit: 'mg',
      };

      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockUpdatedEntry, error: null }),
      });

      const result = await DatabaseService.updateLogbookEntry('entry-1', {
        amount: 50,
      });

      expect(result.data).toEqual(mockUpdatedEntry);
    });
  });

  describe('getCertifications', () => {
    it('should return certifications list', async () => {
      const mockCertifications = [
        {
          id: 'cert-1',
          name: 'NSF Certified',
          issuer: 'NSF International',
          type: 'NSF',
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest
          .fn()
          .mockResolvedValue({ data: mockCertifications, error: null }),
      });

      const result = await DatabaseService.getCertifications();

      expect(result.data).toEqual(mockCertifications);
    });
  });

  describe('getUserPreferences', () => {
    it('should return user preferences', async () => {
      const mockPreferences = {
        id: 'pref-1',
        user_id: 'user-1',
        notifications_enabled: true,
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
      };

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockPreferences, error: null }),
      });

      const result = await DatabaseService.getUserPreferences('user-1');

      expect(result.data).toEqual(mockPreferences);
    });
  });

  describe('updateUserPreferences', () => {
    it('should update user preferences successfully', async () => {
      const mockUpdated = {
        id: 'pref-1',
        theme: 'dark',
      };

      mockFrom.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockUpdated, error: null }),
      });

      const result = await DatabaseService.updateUserPreferences('user-1', {
        theme: 'dark',
      });

      expect(result.data).toEqual(mockUpdated);
    });
  });
});
