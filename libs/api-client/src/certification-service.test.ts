import { CertificationService } from './index';
import type { Certification } from '@wada-bmad/types';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

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

    it('should verify with external APIs if no cache available', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      // Mock the external API calls
      const mockVerifyWithNSF = jest.spyOn(
        CertificationService as any,
        'verifyWithNSF'
      );
      mockVerifyWithNSF.mockResolvedValue({
        verified: true,
        validUntil: new Date(),
      });

      const mockVerifyWithInformedSport = jest.spyOn(
        CertificationService as any,
        'verifyWithInformedSport'
      );
      mockVerifyWithInformedSport.mockResolvedValue({ verified: false });

      const mockVerifyWithGlobalDRO = jest.spyOn(
        CertificationService as any,
        'verifyWithGlobalDRO'
      );
      mockVerifyWithGlobalDRO.mockResolvedValue({
        verified: true,
        validUntil: new Date(),
      });

      const mockGetSupplementInfo = jest.spyOn(
        CertificationService as any,
        'getSupplementInfo'
      );
      mockGetSupplementInfo.mockResolvedValue({
        name: 'Test Supplement',
        brand: 'Test Brand',
        description: 'Test Description',
      });

      const result =
        await CertificationService.verifyBarcodeWithCertifications('123456789');

      expect(result.data.verified).toBe(true);
      expect(result.data.certifications).toHaveLength(2);
      expect(result.data.cached).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should handle API failures gracefully', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      // Mock all external API calls to fail
      const mockVerifyWithNSF = jest.spyOn(
        CertificationService as any,
        'verifyWithNSF'
      );
      mockVerifyWithNSF.mockRejectedValue(new Error('API Error'));

      const mockVerifyWithInformedSport = jest.spyOn(
        CertificationService as any,
        'verifyWithInformedSport'
      );
      mockVerifyWithInformedSport.mockRejectedValue(new Error('API Error'));

      const mockVerifyWithGlobalDRO = jest.spyOn(
        CertificationService as any,
        'verifyWithGlobalDRO'
      );
      mockVerifyWithGlobalDRO.mockRejectedValue(new Error('API Error'));

      // Mock DatabaseService fallback
      const mockDatabaseService = jest.spyOn(
        require('./index'),
        'DatabaseService'
      );
      mockDatabaseService.verifySupplementByBarcode = jest
        .fn()
        .mockResolvedValue({
          data: {
            name: 'Fallback Supplement',
            brand: 'Fallback Brand',
            certifications: [],
          },
        });

      const result =
        await CertificationService.verifyBarcodeWithCertifications('123456789');

      expect(result.data.verified).toBe(true);
      expect(result.data.cached).toBe(true);
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
