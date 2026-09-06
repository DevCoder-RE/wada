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

interface CertifiedSupplementRow {
  supplement_id: string;
  name: string;
  brand: string;
  description?: string;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    type: Certification['type'];
    valid_until?: string;
  }>;
}

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

      const result = await this.verifyFromDatabase(barcode);
      this.cacheVerification(barcode, result);

      return { data: result };
    } catch (error) {
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

  private static async verifyFromDatabase(
    barcode: string
  ): Promise<CertificationData> {
    const result = await DatabaseService.verifySupplementByBarcode(barcode);
    const row = result.data as CertifiedSupplementRow | null;

    if (!row) {
      return {
        verified: false,
        certifications: [],
        cached: false,
      };
    }

    const certifications: Certification[] = (row.certifications || []).map(
      (cert) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        type: cert.type,
        valid_until: cert.valid_until
          ? new Date(cert.valid_until)
          : undefined,
        created_at: new Date(),
        updated_at: new Date(),
      })
    );

    return {
      verified: certifications.length > 0,
      certifications,
      supplement: {
        name: row.name || 'Unknown Supplement',
        brand: row.brand || 'Unknown Brand',
        description: row.description,
      },
      cached: false,
    };
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