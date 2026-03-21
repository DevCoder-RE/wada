import { useEffect, useState, useCallback } from 'react';
import { DatabaseService, CertificationService } from '@wada-bmad/api-client';
import type {
  Supplement,
  Certification,
  ScanHistoryEntry,
} from '@wada-bmad/types';

const SCAN_HISTORY_KEY = 'wada-bmad-scan-history';
const MAX_HISTORY_ITEMS = 50;

interface VerificationResult {
  verified: boolean;
  certifications: Certification[];
  supplement?: { name: string; brand: string; description?: string };
  cached: boolean;
  loading: boolean;
  error?: string;
}

export const useScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [matchedSupplement, setMatchedSupplement] = useState<Supplement | null>(
    null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  useEffect(() => {
    const loadSupplements = async () => {
      const result = await DatabaseService.getSupplements();
      if (result.data) {
        setSupplements(result.data);
      }
    };

    const loadScanHistory = () => {
      try {
        const stored = localStorage.getItem(SCAN_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setScanHistory(
            parsed.map((item: any) => ({
              ...item,
              scannedAt: new Date(item.scannedAt),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load scan history:', error);
      }
    };

    loadSupplements();
    loadScanHistory();
  }, []);

  const saveScanToHistory = useCallback(
    (
      barcode: string,
      supplementName?: string,
      brand?: string,
      verified: boolean = false
    ) => {
      const newEntry: ScanHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        barcode,
        supplementName,
        brand,
        verified,
        scannedAt: new Date(),
      };

      setScanHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, MAX_HISTORY_ITEMS);
        try {
          localStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save scan history:', error);
        }
        return updated;
      });

      return newEntry;
    },
    []
  );

  const clearScanHistory = useCallback(() => {
    setScanHistory([]);
    localStorage.removeItem(SCAN_HISTORY_KEY);
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    setLastScanned(barcode);

    setVerificationResult({
      verified: false,
      certifications: [],
      cached: false,
      loading: true,
    });

    try {
      const verification =
        await CertificationService.verifyBarcodeWithCertifications(barcode);

      setVerificationResult({
        verified: verification.data.verified,
        certifications: verification.data.certifications,
        supplement: verification.data.supplement,
        cached: verification.data.cached,
        loading: false,
        error: verification.error,
      });

      const match = supplements.find((s) => s.barcode === barcode);
      if (match) {
        setMatchedSupplement(match);
        saveScanToHistory(
          barcode,
          match.name,
          match.brand,
          verification.data.verified
        );
      } else if (verification.data.supplement) {
        setMatchedSupplement({
          id: `temp-${barcode}`,
          name: verification.data.supplement.name,
          brand: verification.data.supplement.brand,
          description: verification.data.supplement.description,
          ingredients: [],
          certifications: verification.data.certifications,
          barcode: barcode,
          created_at: new Date(),
          updated_at: new Date(),
        });
        saveScanToHistory(
          barcode,
          verification.data.supplement.name,
          verification.data.supplement.brand,
          verification.data.verified
        );
      } else {
        setMatchedSupplement(null);
        saveScanToHistory(barcode);
      }

      setShowAddForm(true);
    } catch (error) {
      setVerificationResult({
        verified: false,
        certifications: [],
        cached: false,
        loading: false,
        error: 'Verification failed',
      });
      saveScanToHistory(barcode);
      setShowAddForm(true);
    }
  };

  const resetScanner = () => {
    setLastScanned('');
    setMatchedSupplement(null);
    setShowAddForm(false);
    setVerificationResult(null);
  };

  return {
    isScanning,
    setIsScanning,
    lastScanned,
    scanHistory,
    matchedSupplement,
    showAddForm,
    setShowAddForm,
    verificationResult,
    handleBarcodeDetected,
    resetScanner,
    clearScanHistory,
  };
};
