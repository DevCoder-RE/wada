import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Scanner from './Scanner';

// Mock the components
jest.mock('../components/BarcodeScanner', () => {
  return function MockBarcodeScanner({
    onBarcodeDetected,
    onError,
    isScanning,
    onScanningChange,
  }: any) {
    return (
      <div data-testid="barcode-scanner">
        <button
          data-testid="start-scanning"
          onClick={() => onScanningChange(true)}
        >
          Start Scanning
        </button>
        <button
          data-testid="stop-scanning"
          onClick={() => onScanningChange(false)}
        >
          Stop Scanning
        </button>
        <button
          data-testid="detect-barcode"
          onClick={() => onBarcodeDetected('1234567890123')}
        >
          Detect Barcode
        </button>
        <button
          data-testid="trigger-error"
          onClick={() => onError('Test error')}
        >
          Trigger Error
        </button>
      </div>
    );
  };
});

jest.mock('../components/VerificationResults', () => {
  return function MockVerificationResults({ verificationResult }: any) {
    return verificationResult ? (
      <div data-testid="verification-results">
        {verificationResult.loading && <div>Loading...</div>}
        {verificationResult.verified && <div>Verified</div>}
        {verificationResult.error && (
          <div>Error: {verificationResult.error}</div>
        )}
      </div>
    ) : null;
  };
});

jest.mock('../components/RecentScans', () => {
  return function MockRecentScans({ lastScanned }: any) {
    return (
      <div data-testid="recent-scans">
        {lastScanned ? `Last scanned: ${lastScanned}` : 'No recent scans'}
      </div>
    );
  };
});

jest.mock('../components/AddEntryForm', () => {
  return function MockAddEntryForm({ onSubmit, onCancel }: any) {
    return (
      <div data-testid="add-entry-form">
        <button
          data-testid="submit-entry"
          onClick={() => onSubmit(100, 'mg', 'Test notes')}
        >
          Submit Entry
        </button>
        <button data-testid="cancel-entry" onClick={onCancel}>
          Cancel
        </button>
      </div>
    );
  };
});

// Mock the hook
jest.mock('../hooks/useScanner', () => ({
  useScanner: jest.fn(),
}));

// Mock API services
jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
  },
  DatabaseService: {
    createLogbookEntry: jest.fn(),
  },
}));

const mockUseScanner = require('../hooks/useScanner').useScanner;
const mockAuthService = require('@wada-bmad/api-client').AuthService;
const mockDatabaseService = require('@wada-bmad/api-client').DatabaseService;

describe('Scanner', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }));

    // Mock useScanner hook
    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '',
      matchedSupplement: null,
      showAddForm: false,
      setShowAddForm: jest.fn(),
      verificationResult: null,
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    // Mock AuthService
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    });

    // Mock DatabaseService
    mockDatabaseService.createLogbookEntry.mockResolvedValue({
      data: { id: '1' },
    });
  });

  const renderScanner = () => {
    return render(
      <BrowserRouter>
        <Scanner />
      </BrowserRouter>
    );
  };

  it('renders scanner page with all components', () => {
    renderScanner();

    expect(screen.getByText('Supplement Scanner')).toBeInTheDocument();
    expect(
      screen.getByText('Scan a supplement barcode to quickly log your intake.')
    ).toBeInTheDocument();
    expect(screen.getByTestId('barcode-scanner')).toBeInTheDocument();
    expect(screen.getByTestId('recent-scans')).toBeInTheDocument();
  });

  it('displays privacy notice', () => {
    renderScanner();

    expect(screen.getByText('Privacy Notice:')).toBeInTheDocument();
    expect(
      screen.getByText(/This app requires camera access/)
    ).toBeInTheDocument();
  });

  it('shows verification results when available', () => {
    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: {
        id: '1',
        name: 'Test Supplement',
        brand: 'Test Brand',
        barcode: '1234567890123',
      },
      showAddForm: true,
      setShowAddForm: jest.fn(),
      verificationResult: {
        verified: true,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    expect(screen.getByTestId('verification-results')).toBeInTheDocument();
    expect(screen.getByText('Add Test Supplement')).toBeInTheDocument();
    expect(screen.getByTestId('add-entry-form')).toBeInTheDocument();
  });

  it('shows unknown supplement form when no match found', () => {
    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '9999999999999',
      matchedSupplement: null,
      showAddForm: true,
      setShowAddForm: jest.fn(),
      verificationResult: {
        verified: false,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    expect(screen.getByText('Add Unknown Supplement')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Supplement not found in database. Barcode: 9999999999999'
      )
    ).toBeInTheDocument();
  });

  it('handles successful entry submission', async () => {
    const mockSetShowAddForm = jest.fn();
    const mockResetScanner = jest.fn();

    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: {
        id: '1',
        name: 'Test Supplement',
        brand: 'Test Brand',
        barcode: '1234567890123',
      },
      showAddForm: true,
      setShowAddForm: mockSetShowAddForm,
      verificationResult: {
        verified: true,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: mockResetScanner,
    });

    renderScanner();

    fireEvent.click(screen.getByTestId('submit-entry'));

    await waitFor(() => {
      expect(mockDatabaseService.createLogbookEntry).toHaveBeenCalledWith({
        athleteId: '1',
        supplementId: '1',
        amount: 100,
        unit: 'mg',
        notes: 'Test notes',
        verified: true,
      });
      expect(mockSetShowAddForm).toHaveBeenCalledWith(false);
      expect(mockResetScanner).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/logbook');
    });
  });

  it('handles entry submission for temporary supplement', async () => {
    const mockSetShowAddForm = jest.fn();
    const mockResetScanner = jest.fn();

    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '9999999999999',
      matchedSupplement: {
        id: 'temp-9999999999999',
        name: 'Unknown Supplement',
        brand: 'Unknown Brand',
        barcode: '9999999999999',
      },
      showAddForm: true,
      setShowAddForm: mockSetShowAddForm,
      verificationResult: {
        verified: false,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: mockResetScanner,
    });

    renderScanner();

    fireEvent.click(screen.getByTestId('submit-entry'));

    await waitFor(() => {
      expect(mockDatabaseService.createLogbookEntry).toHaveBeenCalledWith({
        athleteId: '1',
        supplementId: null, // Should be null for temp IDs
        amount: 100,
        unit: 'mg',
        notes: 'Test notes',
        verified: false,
      });
    });
  });

  it('handles entry submission error', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockDatabaseService.createLogbookEntry.mockResolvedValue({
      error: 'Database error',
    });

    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: {
        id: '1',
        name: 'Test Supplement',
        brand: 'Test Brand',
        barcode: '1234567890123',
      },
      showAddForm: true,
      setShowAddForm: jest.fn(),
      verificationResult: {
        verified: true,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    fireEvent.click(screen.getByTestId('submit-entry'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Database error');
    });

    alertMock.mockRestore();
  });

  it('handles authentication error during entry submission', async () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: {
        id: '1',
        name: 'Test Supplement',
        brand: 'Test Brand',
        barcode: '1234567890123',
      },
      showAddForm: true,
      setShowAddForm: jest.fn(),
      verificationResult: {
        verified: true,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    fireEvent.click(screen.getByTestId('submit-entry'));

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Failed to add entry');
    });

    alertMock.mockRestore();
  });

  it('shows scanned barcode when scanning', () => {
    mockUseScanner.mockReturnValue({
      isScanning: true,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: null,
      showAddForm: false,
      setShowAddForm: jest.fn(),
      verificationResult: null,
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    expect(screen.getByText('Scanned: 1234567890123')).toBeInTheDocument();
  });

  it('displays supplement details in add form', () => {
    mockUseScanner.mockReturnValue({
      isScanning: false,
      setIsScanning: jest.fn(),
      lastScanned: '1234567890123',
      matchedSupplement: {
        id: '1',
        name: 'Test Supplement',
        brand: 'Test Brand',
        description: 'A test supplement description',
        barcode: '1234567890123',
      },
      showAddForm: true,
      setShowAddForm: jest.fn(),
      verificationResult: {
        verified: true,
        certifications: [],
        cached: false,
        loading: false,
      },
      handleBarcodeDetected: jest.fn(),
      resetScanner: jest.fn(),
    });

    renderScanner();

    expect(screen.getByText('Test Supplement')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(
      screen.getByText('A test supplement description')
    ).toBeInTheDocument();
  });
});
