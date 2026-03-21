import { renderHook, act, waitFor } from '@testing-library/react';
import { useScanHistory } from './useScanHistory';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useScanHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('initialization', () => {
    it('loads empty history from empty localStorage', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scanHistory).toEqual([]);
      expect(result.current.lastScanned).toBeNull();
    });

    it('loads existing history from localStorage', async () => {
      const storedHistory = JSON.stringify([
        {
          id: 'scan-1',
          barcode: '123456789012',
          supplementName: 'Test Supplement',
          verified: true,
          scannedAt: '2024-01-15T10:30:00.000Z',
        },
      ]);
      localStorageMock.getItem.mockReturnValue(storedHistory);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scanHistory).toHaveLength(1);
      expect(result.current.scanHistory[0].barcode).toBe('123456789012');
      expect(result.current.scanHistory[0].scannedAt).toBeInstanceOf(Date);
    });

    it('handles localStorage errors gracefully', async () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scanHistory).toEqual([]);
    });
  });

  describe('addScan', () => {
    it('adds a new scan to history', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addScan(
          '123456789012',
          'Test Supplement',
          'Test Brand',
          true
        );
      });

      expect(result.current.scanHistory).toHaveLength(1);
      expect(result.current.scanHistory[0].barcode).toBe('123456789012');
      expect(result.current.scanHistory[0].supplementName).toBe(
        'Test Supplement'
      );
      expect(result.current.scanHistory[0].verified).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('adds scans without optional fields', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addScan('999999999999');
      });

      expect(result.current.scanHistory).toHaveLength(1);
      expect(result.current.scanHistory[0].barcode).toBe('999999999999');
      expect(result.current.scanHistory[0].supplementName).toBeUndefined();
    });

    it('limits history to 50 items', async () => {
      const existingHistory = Array.from({ length: 50 }, (_, i) => ({
        id: `scan-${i}`,
        barcode: `barcode-${i}`,
        scannedAt: new Date(Date.now() - i * 1000).toISOString(),
      }));
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addScan('NEW_BARCODE');
      });

      expect(result.current.scanHistory).toHaveLength(50);
      expect(result.current.scanHistory[0].barcode).toBe('NEW_BARCODE');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('updates lastScanned when adding new scan', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.addScan('NEW_BARCODE', 'New Supplement');
      });

      expect(result.current.lastScanned).not.toBeNull();
      expect(result.current.lastScanned?.barcode).toBe('NEW_BARCODE');
    });
  });

  describe('clearHistory', () => {
    it('clears all scan history', async () => {
      const storedHistory = JSON.stringify([
        {
          id: 'scan-1',
          barcode: '123456789012',
          scannedAt: new Date().toISOString(),
        },
      ]);
      localStorageMock.getItem.mockReturnValue(storedHistory);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scanHistory).toHaveLength(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.scanHistory).toEqual([]);
      expect(result.current.lastScanned).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('removeScan', () => {
    it('removes a specific scan by id', async () => {
      const storedHistory = JSON.stringify([
        {
          id: 'scan-1',
          barcode: '111111111111',
          scannedAt: new Date().toISOString(),
        },
        {
          id: 'scan-2',
          barcode: '222222222222',
          scannedAt: new Date().toISOString(),
        },
      ]);
      localStorageMock.getItem.mockReturnValue(storedHistory);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.scanHistory).toHaveLength(2);

      act(() => {
        result.current.removeScan('scan-1');
      });

      expect(result.current.scanHistory).toHaveLength(1);
      expect(result.current.scanHistory[0].id).toBe('scan-2');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('lastScanned', () => {
    it('returns null when history is empty', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastScanned).toBeNull();
    });

    it('returns the most recent scan', async () => {
      const storedHistory = JSON.stringify([
        {
          id: 'scan-1',
          barcode: 'FIRST',
          scannedAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
          id: 'scan-2',
          barcode: 'SECOND',
          scannedAt: new Date('2024-01-15T11:00:00').toISOString(),
        },
      ]);
      localStorageMock.getItem.mockReturnValue(storedHistory);

      const { result } = renderHook(() => useScanHistory());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.lastScanned?.barcode).toBe('SECOND');
    });
  });
});
