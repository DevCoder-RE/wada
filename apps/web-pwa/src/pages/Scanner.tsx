import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService, DatabaseService } from '@wada-bmad/api-client';
import type { Supplement } from '@wada-bmad/types';
import BarcodeScanner from '../components/BarcodeScanner';
import VerificationResults from '../components/VerificationResults';
import RecentScans from '../components/RecentScans';
import AddEntryForm from '../components/AddEntryForm';
import { useScanner } from '../hooks/useScanner';

const Scanner: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const {
    isScanning,
    setIsScanning,
    lastScanned,
    matchedSupplement,
    showAddForm,
    setShowAddForm,
    verificationResult,
    handleBarcodeDetected,
    resetScanner,
  } = useScanner();

  const handleAddEntry = async (
    amount: number,
    unit: string,
    notes?: string
  ) => {
    try {
      const user = await AuthService.getCurrentUser();
      if (user && matchedSupplement) {
        // Determine verification status
        const isVerified = verificationResult?.verified || false;

        const result = await DatabaseService.createLogbookEntry({
          athleteId: user.id,
          supplementId: matchedSupplement.id.startsWith('temp-')
            ? null
            : matchedSupplement.id, // Don't use temp IDs
          amount,
          unit,
          notes,
          verified: isVerified,
        });

        if (result.error) {
          alert(result.error);
        } else {
          alert(`Entry added successfully!${isVerified ? ' (Verified)' : ''}`);
          setShowAddForm(false);
          resetScanner();
          navigate('/logbook');
        }
      }
    } catch (error) {
      console.error('Failed to add entry:', error);
      alert('Failed to add entry');
    }
  };

  const handleScannerError = (errorMessage: string) => {
    setError(errorMessage);
    alert(errorMessage);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Supplement Scanner
        </h1>
        <p className="text-gray-600">
          Scan a supplement barcode to quickly log your intake.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          {/* Privacy Notice */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Privacy Notice:</strong> This app requires camera access
              to scan barcodes. Camera data is processed locally and not stored
              or transmitted.
            </p>
          </div>

          <BarcodeScanner
            onBarcodeDetected={handleBarcodeDetected}
            onError={handleScannerError}
            isScanning={isScanning}
            onScanningChange={setIsScanning}
          />

          {lastScanned && isScanning && (
            <p
              className="text-sm font-medium text-green-600 mt-2"
              aria-live="polite"
            >
              Scanned: {lastScanned}
            </p>
          )}
        </div>
      </div>

      <VerificationResults verificationResult={verificationResult} />

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {matchedSupplement
              ? `Add ${matchedSupplement.name}`
              : 'Add Unknown Supplement'}
          </h3>

          {matchedSupplement && (
            <div className="mb-4 p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-900">
                {matchedSupplement.name}
              </h4>
              <p className="text-sm text-blue-700">{matchedSupplement.brand}</p>
              {matchedSupplement.description && (
                <p className="text-sm text-blue-700">
                  {matchedSupplement.description}
                </p>
              )}
            </div>
          )}

          {!matchedSupplement && lastScanned && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-700">
                Supplement not found in database. Barcode: {lastScanned}
              </p>
              <p className="text-sm text-yellow-700">
                You can still log this entry, but it won't be linked to a known
                supplement.
              </p>
            </div>
          )}

          <AddEntryForm
            onSubmit={handleAddEntry}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      <RecentScans lastScanned={lastScanned} />
    </div>
  );
};

export default Scanner;
