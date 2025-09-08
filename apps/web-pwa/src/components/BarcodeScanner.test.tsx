import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BarcodeScanner from './BarcodeScanner';

// Mock Quagga
jest.mock('@quagga2/quagga2', () => ({
  init: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  onDetected: jest.fn(),
}));

// Mock utils
jest.mock('@wada-bmad/utils', () => ({
  isValidBarcode: jest.fn(),
  parseBarcode: jest.fn(),
}));

const mockQuagga = require('@quagga2/quagga2');
const mockUtils = require('@wada-bmad/utils');

describe('BarcodeScanner', () => {
  const mockOnBarcodeDetected = jest.fn();
  const mockOnError = jest.fn();
  const mockOnScanningChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful camera access
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest.fn().mockResolvedValue({
          getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
        }),
      },
      writable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
    });
  });

  it('renders start scanning button when not scanning', () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    expect(screen.getByText('Start Scanning')).toBeInTheDocument();
    expect(
      screen.getByText('Camera preview will appear here')
    ).toBeInTheDocument();
  });

  it('renders camera feed when scanning', () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={true}
        onScanningChange={mockOnScanningChange}
      />
    );

    expect(
      screen.getByText('Point your camera at a barcode')
    ).toBeInTheDocument();
    expect(screen.getByText('Stop Scanning')).toBeInTheDocument();
  });

  it('starts scanning when start button is clicked', async () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnScanningChange).toHaveBeenCalledWith(true);
    });
  });

  it('stops scanning when stop button is clicked', () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={true}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Stop Scanning'));

    expect(mockOnScanningChange).toHaveBeenCalledWith(false);
    expect(mockQuagga.stop).toHaveBeenCalled();
  });

  it('handles camera permission denied error', async () => {
    const permissionError = new Error('Permission denied');
    permissionError.name = 'NotAllowedError';

    navigator.mediaDevices.getUserMedia.mockRejectedValue(permissionError);

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Camera access failed. Please enable camera permissions in your browser settings.'
      );
    });
  });

  it('handles no camera found error', async () => {
    const notFoundError = new Error('No camera found');
    notFoundError.name = 'NotFoundError';

    navigator.mediaDevices.getUserMedia.mockRejectedValue(notFoundError);

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Camera access failed. No camera found on this device.'
      );
    });
  });

  it('handles insecure context error', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      writable: true,
    });

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Camera access failed. Camera access requires a secure connection (HTTPS).'
      );
    });
  });

  it('handles media devices not supported error', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        'Camera access failed. Camera not supported on this device.'
      );
    });
  });

  it('handles Quagga initialization error', async () => {
    mockQuagga.init.mockImplementation((config, callback) => {
      callback(new Error('Quagga init failed'));
    });

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    fireEvent.click(screen.getByText('Start Scanning'));

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        "Failed to initialize camera. Please check permissions and ensure you're using HTTPS."
      );
      expect(mockOnScanningChange).toHaveBeenCalledWith(false);
    });
  });

  it('detects and processes valid barcode', async () => {
    mockUtils.isValidBarcode.mockReturnValue(true);
    mockUtils.parseBarcode.mockReturnValue('1234567890123');

    mockQuagga.init.mockImplementation((config, callback) => {
      callback(null);
    });

    mockQuagga.onDetected.mockImplementation((callback) => {
      // Simulate barcode detection
      setTimeout(() => {
        callback({
          codeResult: {
            code: '1234567890123',
          },
        });
      }, 100);
    });

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={true}
        onScanningChange={mockOnScanningChange}
      />
    );

    await waitFor(() => {
      expect(mockOnBarcodeDetected).toHaveBeenCalledWith('1234567890123');
      expect(mockOnScanningChange).toHaveBeenCalledWith(false);
    });
  });

  it('ignores invalid barcodes', async () => {
    mockUtils.isValidBarcode.mockReturnValue(false);

    mockQuagga.init.mockImplementation((config, callback) => {
      callback(null);
    });

    mockQuagga.onDetected.mockImplementation((callback) => {
      callback({
        codeResult: {
          code: 'invalid',
        },
      });
    });

    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={true}
        onScanningChange={mockOnScanningChange}
      />
    );

    // Wait a bit to ensure detection logic runs
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockOnBarcodeDetected).not.toHaveBeenCalled();
  });

  it('has proper accessibility attributes', () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={false}
        onScanningChange={mockOnScanningChange}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute(
      'aria-label',
      'Camera preview area - camera not active'
    );
    expect(
      screen.getByRole('button', { name: 'Start barcode scanning with camera' })
    ).toBeInTheDocument();
  });

  it('has proper accessibility attributes when scanning', () => {
    render(
      <BarcodeScanner
        onBarcodeDetected={mockOnBarcodeDetected}
        onError={mockOnError}
        isScanning={true}
        onScanningChange={mockOnScanningChange}
      />
    );

    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute(
      'aria-label',
      'Live camera feed for barcode scanning'
    );
    expect(
      screen.getByRole('button', { name: 'Stop barcode scanning' })
    ).toBeInTheDocument();
  });
});
