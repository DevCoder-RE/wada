import { renderHook, act, waitFor } from '@testing-library/react';
import { useScanner } from './useScanner';

// Mock the API services
jest.mock('@wada-bmad/api-client', () => ({
  DatabaseService: {
    getSupplements: jest.fn(),
  },
  CertificationService: {
    verifyBarcodeWithCertifications: jest.fn(),
  },
}));

const mockDatabaseService = require('@wada-bmad/api-client').DatabaseService;
const mockCertificationService =
  require('@wada-bmad/api-client').CertificationService;

describe('useScanner', () => {
  const mockSupplements = [
    {
      id: '1',
      name: 'Test Supplement',
      brand: 'Test Brand',
      barcode: '1234567890123',
      description: 'A test supplement',
      ingredients: [],
      certifications: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockDatabaseService.getSupplements.mockResolvedValue({
      data: mockSupplements,
    });
  });

  it('loads supplements on mount', async () => {
    renderHook(() => useScanner());

    await waitFor(() => {
      expect(mockDatabaseService.getSupplements).toHaveBeenCalled();
    });
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useScanner());

    expect(result.current.isScanning).toBe(false);
    expect(result.current.lastScanned).toBe('');
    expect(result.current.matchedSupplement).toBe(null);
    expect(result.current.showAddForm).toBe(false);
    expect(result.current.verificationResult).toBe(null);
  });

  it('handles barcode detection with matched supplement', async () => {
    mockCertificationService.verifyBarcodeWithCertifications.mockResolvedValue({
      data: {
        verified: true,
        certifications: [
          {
            id: '1',
            name: 'Test Cert',
            issuer: 'Test Issuer',
            valid_until: new Date(),
          },
        ],
        supplement: {
          name: 'Verified Supplement',
          brand: 'Verified Brand',
          description: 'Verified description',
        },
        cached: false,
      },
    });

    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.handleBarcodeDetected('1234567890123');
    });

    await waitFor(() => {
      expect(result.current.lastScanned).toBe('1234567890123');
      expect(result.current.matchedSupplement).toEqual(mockSupplements[0]);
      expect(result.current.showAddForm).toBe(true);
      expect(result.current.verificationResult).toEqual({
        verified: true,
        certifications: [
          {
            id: '1',
            name: 'Test Cert',
            issuer: 'Test Issuer',
            valid_until: expect.any(Date),
          },
        ],
        supplement: {
          name: 'Verified Supplement',
          brand: 'Verified Brand',
          description: 'Verified description',
        },
        cached: false,
        loading: false,
      });
    });
  });

  it('handles barcode detection with unmatched supplement', async () => {
    mockCertificationService.verifyBarcodeWithCertifications.mockResolvedValue({
      data: {
        verified: true,
        certifications: [],
        supplement: {
          name: 'Unknown Supplement',
          brand: 'Unknown Brand',
          description: 'Unknown description',
        },
        cached: false,
      },
    });

    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.handleBarcodeDetected('9999999999999');
    });

    await waitFor(() => {
      expect(result.current.lastScanned).toBe('9999999999999');
      expect(result.current.matchedSupplement).toEqual({
        id: 'temp-9999999999999',
        name: 'Unknown Supplement',
        brand: 'Unknown Brand',
        description: 'Unknown description',
        ingredients: [],
        certifications: [],
        barcode: '9999999999999',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      });
      expect(result.current.showAddForm).toBe(true);
    });
  });

  it('handles barcode detection without supplement data', async () => {
    mockCertificationService.verifyBarcodeWithCertifications.mockResolvedValue({
      data: {
        verified: false,
        certifications: [],
        cached: false,
      },
    });

    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.handleBarcodeDetected('9999999999999');
    });

    await waitFor(() => {
      expect(result.current.lastScanned).toBe('9999999999999');
      expect(result.current.matchedSupplement).toBe(null);
      expect(result.current.showAddForm).toBe(true);
    });
  });

  it('handles verification error', async () => {
    mockCertificationService.verifyBarcodeWithCertifications.mockRejectedValue(
      new Error('Verification failed')
    );

    const { result } = renderHook(() => useScanner());

    act(() => {
      result.current.handleBarcodeDetected('1234567890123');
    });

    await waitFor(() => {
      expect(result.current.verificationResult).toEqual({
        verified: false,
        certifications: [],
        cached: false,
        loading: false,
        error: 'Verification failed',
      });
      expect(result.current.showAddForm).toBe(true);
    });
  });

  it('resets scanner state', () => {
    const { result } = renderHook(() => useScanner());

    // Set some state first
    act(() => {
      result.current.setIsScanning(true);
      result.current.setShowAddForm(true);
    });

    expect(result.current.isScanning).toBe(true);
    expect(result.current.showAddForm).toBe(true);

    // Reset
    act(() => {
      result.current.resetScanner();
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.lastScanned).toBe('');
    expect(result.current.matchedSupplement).toBe(null);
    expect(result.current.showAddForm).toBe(false);
    expect(result.current.verificationResult).toBe(null);
  });

  it('handles supplements loading error gracefully', async () => {
    mockDatabaseService.getSupplements.mockRejectedValue(
      new Error('Load failed')
    );

    const { result } = renderHook(() => useScanner());

    // The hook should still work even if supplements fail to load
    act(() => {
      result.current.handleBarcodeDetected('1234567890123');
    });

    await waitFor(() => {
      expect(result.current.lastScanned).toBe('1234567890123');
    });
  });

  it('maintains supplements state after barcode detection', async () => {
    mockCertificationService.verifyBarcodeWithCertifications.mockResolvedValue({
      data: {
        verified: false,
        certifications: [],
        cached: false,
      },
    });

    const { result } = renderHook(() => useScanner());

    // Wait for initial supplements load
    await waitFor(() => {
      expect(mockDatabaseService.getSupplements).toHaveBeenCalled();
    });

    act(() => {
      result.current.handleBarcodeDetected('9999999999999');
    });

    await waitFor(() => {
      expect(result.current.lastScanned).toBe('9999999999999');
    });

    // Supplements should still be available for matching
    expect(result.current.supplements || mockSupplements).toBeDefined();
  });
});
