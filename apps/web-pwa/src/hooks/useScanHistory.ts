import { useState, useEffect, useCallback } from 'react';
import type { ScanHistoryEntry } from '@wada-bmad/types';

const STORAGE_KEY = 'wada-bmad-scan-history';
const MAX_HISTORY_ITEMS = 50;

export const useScanHistory = () => {
  const [scanHistory, setScanHistory] = useState<ScanHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
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
        setScanHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const saveHistory = useCallback((history: ScanHistoryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save scan history:', error);
    }
  }, []);

  const addScan = useCallback(
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
        saveHistory(updated);
        return updated;
      });

      return newEntry;
    },
    [saveHistory]
  );

  const clearHistory = useCallback(() => {
    setScanHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const removeScan = useCallback(
    (id: string) => {
      setScanHistory((prev) => {
        const updated = prev.filter((entry) => entry.id !== id);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  return {
    scanHistory,
    isLoading,
    addScan,
    clearHistory,
    removeScan,
    lastScanned: scanHistory.length > 0 ? scanHistory[0] : null,
  };
};
