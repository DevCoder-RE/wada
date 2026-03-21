import type { ApiResponse, Certification } from '@wada-bmad/types';
import { DatabaseService } from './index';

const CACHE_KEY = 'certification_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: CertificationData;
  timestamp: number;
}

interface CertificationData {
  verified: boolean;
  certifications: Certification[];
  supplement?: {
    name: string;
    brand: string;
    description?: string;
  };
  cached: boolean;
}

const MOCK_CERTIFIED_BARCODES: Record<
  string,
  { name: string; brand: string; certifications: string[] }
> = {
  '123456789012': {
    name: 'Whey Protein Isolate',
    brand: 'Optimum Nutrition',
    certifications: ['NSF', 'Informed_Sport'],
  },
  '123456789013': {
    name: 'Creatine Monohydrate',
    brand: 'MuscleTech',
    certifications: ['NSF', 'Informed_Sport'],
  },
  '123456789014': {
    name: 'BCAA Complex',
    brand: 'Scivation',
    certifications: ['Informed_Sport'],
  },
  '123456789015': {
    name: 'Multivitamin',
    brand: 'Centrum',
    certifications: ['NSF'],
  },
  '123456789016': {
    name: 'Fish Oil',
    brand: 'Nordic Naturals',
    certifications: ['NSF'],
  },
};

const CERTIFICATION_MAP: Record<
  string,
  Omit<Certification, 'id' | 'created_at' | 'updated_at'>
> = {
  NSF: {
    name: 'NSF Certified for Sport',
    issuer: 'NSF International',
    type: 'NSF',
    valid_until: new Date('2025-12-31'),
  },
  Informed_Sport: {
    name: 'Informed Sport',
    issuer: 'LGC',
    type: 'Informed_Sport',
    valid_until: new Date('2025-12-31'),
  },
  ISO_17025: {
    name: 'ISO 17025 Accredited',
    issuer: 'ISO',
    type: 'ISO_17025',
    valid_until: new Date('2025-12-31'),
  },
  WADA_Compliant: {
    name: 'WADA Compliant',
    issuer: 'WADA',
    type: 'WADA_Compliant',
    valid_until: new Date('2025-12-31'),
  },
};

export class CertificationService {
  static async verifyBarcodeWithCertifications(
    barcode: string
  ): Promise<ApiResponse<CertificationData>> {
    try {
      const cachedResult = this.getCachedVerification(barcode);
      if (cachedResult && !this.isCacheExpired(cachedResult.timestamp)) {
        return {
          data: {
            ...cachedResult.data,
            cached: true,
          },
        };
      }

      const [nsfResult, informedSportResult, globalDROResult] =
        await Promise.all([
          this.verifyWithNSF(barcode),
          this.verifyWithInformedSport(barcode),
          this.verifyWithGlobalDRO(barcode),
        ]);

      const certifications: Certification[] = [];

      if (nsfResult.verified && nsfResult.certificationType) {
        const cert = CERTIFICATION_MAP[nsfResult.certificationType];
        if (cert) {
          certifications.push({
            id: `cert-${Date.now()}-nsf`,
            ...cert,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      if (
        informedSportResult.verified &&
        informedSportResult.certificationType
      ) {
        const cert = CERTIFICATION_MAP[informedSportResult.certificationType];
        if (cert) {
          certifications.push({
            id: `cert-${Date.now()}-is`,
            ...cert,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      if (globalDROResult.verified && globalDROResult.certificationType) {
        const cert = CERTIFICATION_MAP[globalDROResult.certificationType];
        if (cert) {
          certifications.push({
            id: `cert-${Date.now()}-gdro`,
            ...cert,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }

      let supplement: CertificationData['supplement'] | undefined;

      const mockData = MOCK_CERTIFIED_BARCODES[barcode];
      if (mockData) {
        supplement = {
          name: mockData.name,
          brand: mockData.brand,
        };
      } else {
        const dbResult = await this.getSupplementInfo(barcode);
        if (dbResult) {
          supplement = dbResult;
        }
      }

      const result: CertificationData = {
        verified: certifications.length > 0,
        certifications,
        supplement,
        cached: false,
      };

      this.cacheVerification(barcode, result);

      return { data: result };
    } catch (error) {
      const dbFallback =
        await DatabaseService.verifySupplementByBarcode(barcode);
      if (dbFallback.data) {
        return {
          data: {
            verified: false,
            certifications: [],
            supplement: {
              name: dbFallback.data.name || 'Unknown',
              brand: dbFallback.data.brand || 'Unknown',
            },
            cached: true,
          },
        };
      }

      return {
        data: {
          verified: false,
          certifications: [],
          cached: false,
        },
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  private static async verifyWithNSF(
    barcode: string
  ): Promise<{ verified: boolean; certificationType?: string }> {
    const mockData = MOCK_CERTIFIED_BARCODES[barcode];
    if (mockData && mockData.certifications.includes('NSF')) {
      return {
        verified: true,
        certificationType: 'NSF',
      };
    }
    return { verified: false };
  }

  private static async verifyWithInformedSport(
    barcode: string
  ): Promise<{ verified: boolean; certificationType?: string }> {
    const mockData = MOCK_CERTIFIED_BARCODES[barcode];
    if (mockData && mockData.certifications.includes('Informed_Sport')) {
      return {
        verified: true,
        certificationType: 'Informed_Sport',
      };
    }
    return { verified: false };
  }

  private static async verifyWithGlobalDRO(
    barcode: string
  ): Promise<{ verified: boolean; certificationType?: string }> {
    const mockData = MOCK_CERTIFIED_BARCODES[barcode];
    if (mockData && mockData.certifications.includes('WADA_Compliant')) {
      return {
        verified: true,
        certificationType: 'WADA_Compliant',
      };
    }
    return { verified: false };
  }

  private static async getSupplementInfo(
    barcode: string
  ): Promise<{ name: string; brand: string; description?: string } | null> {
    try {
      const result = await DatabaseService.verifySupplementByBarcode(barcode);
      if (result.data) {
        return {
          name: result.data.name || 'Unknown Supplement',
          brand: result.data.brand || 'Unknown Brand',
          description: result.data.description,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private static getCachedVerification(barcode: string): CacheEntry | null {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      if (!cacheData) return null;

      const cache = JSON.parse(cacheData) as Record<string, CacheEntry>;
      return cache[barcode] || null;
    } catch {
      return null;
    }
  }

  private static cacheVerification(
    barcode: string,
    data: CertificationData
  ): void {
    try {
      const cacheData = localStorage.getItem(CACHE_KEY);
      const cache = cacheData
        ? (JSON.parse(cacheData) as Record<string, CacheEntry>)
        : {};

      cache[barcode] = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache verification:', error);
    }
  }

  static isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_DURATION_MS;
  }

  static clearCache(): void {
    localStorage.removeItem(CACHE_KEY);
  }
}
