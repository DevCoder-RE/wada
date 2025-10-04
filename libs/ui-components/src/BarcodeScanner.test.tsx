import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BarcodeScanner } from './BarcodeScanner';

// Mock Quagga library
jest.mock('@ericblade/quagga2', () => ({
  init: jest.fn((config, callback) => {
    // Simulate successful initialization
    setTimeout(() => callback(null), 100);
  }),
  start: jest.fn(),
  stop: jest.fn(),
  onDetected: jest.fn(),
}));

// Mock the debounce utility
jest.mock('@wada-bmad/utils', () => ({
  debounce: jest.fn((fn) => fn),
}));

describe('BarcodeScanner', () => {
  const mockOnScan = jest.fn();
  const mockOnError = jest.fn();
  const mockOnStop = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders start scanning button when not scanning', () => {
    render(<BarcodeScanner onScan={mockOnScan} />);

    expect(screen.getByText('Start Scanning')).toBeInTheDocument();
    expect(
      screen.getByText('Camera preview will appear here')
    ).toBeInTheDocument();
  });

  test('renders camera preview and stop button when scanning', async () => {
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

    render(<BarcodeScanner onScan={mockOnScan} />);

    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(
        screen.getByText('Point your camera at a barcode')
      ).toBeInTheDocument();
      expect(screen.getByText('Stop Scanning')).toBeInTheDocument();
    });
  });

  test('calls onError when camera access fails', async () => {
    // Mock camera access failure
    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: jest
          .fn()
          .mockRejectedValue(new Error('Camera not allowed')),
      },
      writable: true,
    });

    render(<BarcodeScanner onScan={mockOnScan} onError={mockOnError} />);

    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Camera access failed')
      );
    });
  });

  test('calls onStop when stop scanning is clicked', async () => {
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

    render(<BarcodeScanner onScan={mockOnScan} onStop={mockOnStop} />);

    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);

    await waitFor(() => {
      const stopButton = screen.getByText('Stop Scanning');
      fireEvent.click(stopButton);
      expect(mockOnStop).toHaveBeenCalled();
    });
  });

  test('handles insecure context error', async () => {
    Object.defineProperty(window, 'isSecureContext', {
      value: false,
      writable: true,
    });

    render(<BarcodeScanner onScan={mockOnScan} onError={mockOnError} />);

    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Camera access requires HTTPS')
      );
    });
  });

  test('handles unsupported media devices', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: undefined,
      writable: true,
    });

    render(<BarcodeScanner onScan={mockOnScan} onError={mockOnError} />);

    const startButton = screen.getByText('Start Scanning');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(
        expect.stringContaining('Camera not supported on this device')
      );
    });
  });
});
