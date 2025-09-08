import { useEffect, useState } from 'react';
import { DatabaseService, CertificationService } from '@wada-bmad/api-client';
import type { Supplement, Certification } from '@wada-bmad/types';

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

    loadSupplements();
  }, []);

  const handleBarcodeDetected = async (barcode: string) => {
    setLastScanned(barcode);

    // Start verification process
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

      // Find matching supplement in local database
      const match = supplements.find((s) => s.barcode === barcode);
      if (match) {
        setMatchedSupplement(match);
      } else if (verification.data.supplement) {
        // Create a temporary supplement object from verification result
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
      } else {
        setMatchedSupplement(null);
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
    matchedSupplement,
    showAddForm,
    setShowAddForm,
    verificationResult,
    handleBarcodeDetected,
    resetScanner,
  };
};
