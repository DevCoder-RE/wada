import { CertificationService, DatabaseService } from './index';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

const MOCK_DB_ROW = {
  supplement_id: 'supp-1',
  name: 'Creatine Monohydrate',
  brand: 'MuscleTech',
  description: 'Pure creatine for strength and power',
  certifications: [
    {
      id: 'cert-1',
      name: 'NSF Certified for Sport',
      issuer: 'NSF International',
      type: 'NSF' as const,
      valid_until: '2025-12-31',
    },
  ],
};

describe('CertificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('verifyBarcodeWithCertifications', () => {
    it('should return cached result if available and not expired', async () => {
      const cachedData = {
        verified: true,
        certifications: [
          {
            id: 'test-cert',
            name: 'Test Certification',
            issuer: 'Test Issuer',
            type: 'NSF' as const,
            valid_until: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        supplement: {
          name: 'Test Supplement',
          brand: 'Test Brand',
        },
      };

      const cacheEntry = {
        data: cachedData,
        timestamp: Date.now() - 1000, // Not expired
      };

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ '123456789': cacheEntry })
      );

      const result =
        await CertificationService.verifyBarcodeWithCertifications('123456789');

      expect(result.data).toEqual({
        ...cachedData,
        cached: true,
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'certification_cache'
      );
    });

    it('should verify supplement using database certification data', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockResolvedValue({ data: MOCK_DB_ROW } as any);

      const result =
        await CertificationService.verifyBarcodeWithCertifications(
          '123456789013'
        );

      expect(result.data.verified).toBe(true);
      expect(result.data.certifications).toHaveLength(1);
      expect(result.data.certifications[0]).toMatchObject({
        type: 'NSF',
        name: 'NSF Certified for Sport',
        issuer: 'NSF International',
      });
      expect(result.data.supplement).toEqual({
        name: 'Creatine Monohydrate',
        brand: 'MuscleTech',
        description: 'Pure creatine for strength and power',
      });
      expect(result.data.cached).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return unverified when the supplement has no certifications', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockResolvedValue({
          data: { ...MOCK_DB_ROW, certifications: [] },
        } as any);

      const result =
        await CertificationService.verifyBarcodeWithCertifications(
          '123456789099'
        );

      expect(result.data.verified).toBe(false);
      expect(result.data.certifications).toEqual([]);
      expect(result.data.supplement?.name).toBe('Creatine Monohydrate');
    });

    it('should return unverified for an unknown barcode', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockResolvedValue({ data: null } as any);

      const result =
        await CertificationService.verifyBarcodeWithCertifications('unknown');

      expect(result.data.verified).toBe(false);
      expect(result.data.certifications).toEqual([]);
      expect(result.data.supplement).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should ignore corrupted cache entries', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockResolvedValue({ data: MOCK_DB_ROW } as any);

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          '123456789': {
            data: 'not-a-cache-entry',
            timestamp: Date.now(),
          },
        })
      );

      const result =
        await CertificationService.verifyBarcodeWithCertifications(
          '123456789'
        );

      expect(result.data.verified).toBe(true);
      expect(DatabaseService.verifySupplementByBarcode).toHaveBeenCalledWith(
        '123456789'
      );
    });

    it('should ignore invalid JSON cache payloads', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockResolvedValue({ data: MOCK_DB_ROW } as any);

      localStorageMock.getItem.mockReturnValue('not valid json {');

      const result =
        await CertificationService.verifyBarcodeWithCertifications(
          '123456789'
        );

      expect(result.data.verified).toBe(true);
      expect(DatabaseService.verifySupplementByBarcode).toHaveBeenCalledWith(
        '123456789'
      );
    });

    it('should handle verification errors', async () => {
      jest
        .spyOn(DatabaseService, 'verifySupplementByBarcode')
        .mockRejectedValue(new Error('Network error'));

      const result =
        await CertificationService.verifyBarcodeWithCertifications('123456789');

      expect(result.data.verified).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('cache management', () => {
    it('should clear cache when requested', () => {
      CertificationService.clearCache();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'certification_cache'
      );
    });

    it('should detect expired cache entries', () => {
      const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const isExpired = (CertificationService as any).isCacheExpired(
        expiredTimestamp
      );

      expect(isExpired).toBe(true);
    });

    it('should not mark valid cache entries as expired', () => {
      const validTimestamp = Date.now() - 12 * 60 * 60 * 1000; // 12 hours ago
      const isExpired = (CertificationService as any).isCacheExpired(
        validTimestamp
      );

      expect(isExpired).toBe(false);
    });
  });
});