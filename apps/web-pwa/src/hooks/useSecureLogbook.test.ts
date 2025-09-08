// useSecureLogbook Hook Tests
// Tests for secure logbook functionality integration

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSecureLogbook } from './useSecureLogbook';
import {
  SecureLogbookService,
  DatabaseService,
  AuthService,
} from '@wada-bmad/api-client';

// Mock dependencies
jest.mock('@wada-bmad/api-client', () => ({
  SecureLogbookService: {
    getSecureEntries: jest.fn(),
    createSecureEntry: jest.fn(),
    updateSecureEntry: jest.fn(),
    deleteEntry: jest.fn(),
    getComplianceSummary: jest.fn(),
  },
  DatabaseService: {
    getSupplements: jest.fn(),
  },
  AuthService: {
    getCurrentUser: jest.fn(),
  },
}));

const mockSecureLogbookService = SecureLogbookService as jest.Mocked<
  typeof SecureLogbookService
>;
const mockDatabaseService = DatabaseService as jest.Mocked<
  typeof DatabaseService
>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('useSecureLogbook', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockEntries = [
    {
      id: 'entry-1',
      athlete_id: 'user-123',
      supplement_id: 'supp-1',
      amount: 100,
      unit: 'mg',
      verified: true,
      timestamp: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  const mockSupplements = [
    {
      id: 'supp-1',
      name: 'Test Supplement',
      brand: 'Test Brand',
      certifications: [],
      ingredients: [],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  const mockComplianceSummary = {
    athlete_id: 'user-123',
    period: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31'),
    },
    metrics: {
      total_entries: 1,
      verified_entries: 1,
      compliance_rate: 100,
      unique_supplements: 1,
      certifications_count: 1,
    },
    alerts: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockSecureLogbookService.getSecureEntries.mockResolvedValue({
      data: mockEntries,
      error: undefined,
    });
    mockDatabaseService.getSupplements.mockResolvedValue({
      data: mockSupplements,
      error: undefined,
    });
    mockSecureLogbookService.getComplianceSummary.mockResolvedValue({
      data: mockComplianceSummary,
      error: undefined,
    });
  });

  it('should load data on mount when autoLoad is true', async () => {
    renderHook(() => useSecureLogbook({ autoLoad: true }));

    await waitFor(() => {
      expect(mockAuthService.getCurrentUser).toHaveBeenCalled();
      expect(mockSecureLogbookService.getSecureEntries).toHaveBeenCalledWith(
        'user-123',
        { includeAudit: undefined }
      );
      expect(mockDatabaseService.getSupplements).toHaveBeenCalled();
      expect(
        mockSecureLogbookService.getComplianceSummary
      ).toHaveBeenCalledWith('user-123');
    });
  });

  it('should not load data on mount when autoLoad is false', () => {
    renderHook(() => useSecureLogbook({ autoLoad: false }));

    expect(mockAuthService.getCurrentUser).not.toHaveBeenCalled();
    expect(mockSecureLogbookService.getSecureEntries).not.toHaveBeenCalled();
  });

  it('should handle authentication failure', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: true }));

    await waitFor(() => {
      expect(result.current.error).toContain('No athlete ID provided');
      expect(result.current.loading).toBe(false);
    });
  });

  it('should create entry successfully', async () => {
    mockSecureLogbookService.createSecureEntry.mockResolvedValue({
      data: mockEntries[0],
      error: undefined,
    });

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    const entryData = {
      athleteId: 'user-123',
      supplementId: 'supp-1',
      amount: 100,
      unit: 'mg' as const,
      notes: 'Test entry',
    };

    await act(async () => {
      await result.current.createEntry(entryData);
    });

    expect(mockSecureLogbookService.createSecureEntry).toHaveBeenCalledWith(
      entryData,
      undefined
    );
  });

  it('should handle create entry error', async () => {
    mockSecureLogbookService.createSecureEntry.mockResolvedValue({
      data: {} as any,
      error: 'Failed to create entry',
    });

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    const entryData = {
      athleteId: 'user-123',
      supplementId: 'supp-1',
      amount: 100,
      unit: 'mg' as const,
    };

    await act(async () => {
      await result.current.createEntry(entryData);
    });

    expect(result.current.error).toBe('Failed to create entry');
  });

  it('should update entry successfully', async () => {
    const updatedEntry = { ...mockEntries[0], amount: 200 };
    mockSecureLogbookService.updateSecureEntry.mockResolvedValue({
      data: updatedEntry,
      error: undefined,
    });

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    await act(async () => {
      await result.current.updateEntry('entry-1', { amount: 200 });
    });

    expect(mockSecureLogbookService.updateSecureEntry).toHaveBeenCalledWith(
      'entry-1',
      { amount: 200 }
    );
  });

  it('should handle update entry error', async () => {
    mockSecureLogbookService.updateSecureEntry.mockResolvedValue({
      data: {} as any,
      error: 'Failed to update entry',
    });

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    await act(async () => {
      await result.current.updateEntry('entry-1', { amount: 200 });
    });

    expect(result.current.error).toBe('Failed to update entry');
  });

  it('should verify entry successfully', async () => {
    const verifiedEntry = {
      ...mockEntries[0],
      verified: true,
      verification_data: {
        certifications: [],
        verified_at: new Date(),
        verified_by: 'user-123',
        verification_method: 'barcode_scan',
      },
    };

    mockSecureLogbookService.updateSecureEntry.mockResolvedValue({
      data: verifiedEntry,
      error: undefined,
    });

    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    await act(async () => {
      await result.current.verifyEntry('entry-1', '123456789');
    });

    expect(mockSecureLogbookService.updateSecureEntry).toHaveBeenCalledWith(
      'entry-1',
      expect.objectContaining({
        verified: true,
        verification_data: expect.any(Object),
      })
    );
  });

  it('should refresh data successfully', async () => {
    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    await act(async () => {
      await result.current.refreshData();
    });

    expect(mockSecureLogbookService.getSecureEntries).toHaveBeenCalled();
    expect(mockDatabaseService.getSupplements).toHaveBeenCalled();
    expect(mockSecureLogbookService.getComplianceSummary).toHaveBeenCalled();
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    // Simulate an error
    act(() => {
      (result.current as any).error = 'Test error';
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useSecureLogbook({ autoLoad: false }));

    expect(result.current.entries).toEqual([]);
    expect(result.current.supplements).toEqual([]);
    expect(result.current.complianceSummary).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.createEntry).toBe('function');
    expect(typeof result.current.updateEntry).toBe('function');
    expect(typeof result.current.deleteEntry).toBe('function');
    expect(typeof result.current.verifyEntry).toBe('function');
    expect(typeof result.current.refreshData).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });
});
