import { RealtimeService, ErrorHandler } from './index';
import { supabase } from './index';

// Mock supabase
jest.mock('./index', () => {
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  };
  return {
    supabase: {
      channel: jest.fn(() => mockChannel),
      removeChannel: jest.fn(),
    },
  };
});

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('RealtimeService', () => {
  const mockCallback = jest.fn();
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
    unsubscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase.channel.mockReturnValue(mockChannel as any);
  });

  describe('subscribeToLogbookUpdates', () => {
    it('creates a channel with correct name', () => {
      RealtimeService.subscribeToLogbookUpdates('user-1', mockCallback);

      expect(mockSupabase.channel).toHaveBeenCalledWith('logbook_updates');
    });

    it('sets up postgres_changes listener', () => {
      RealtimeService.subscribeToLogbookUpdates('user-1', mockCallback);

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'logbook_entries',
          filter: 'athleteId=eq.user-1',
        }),
        mockCallback
      );
    });

    it('subscribes to the channel', () => {
      RealtimeService.subscribeToLogbookUpdates('user-1', mockCallback);

      expect(mockChannel.subscribe).toHaveBeenCalled();
    });

    it('returns unsubscribe function', () => {
      const unsubscribe = RealtimeService.subscribeToLogbookUpdates(
        'user-1',
        mockCallback
      );

      expect(typeof unsubscribe).toBe('function');
    });

    it('removes channel when unsubscribe is called', () => {
      const unsubscribe = RealtimeService.subscribeToLogbookUpdates(
        'user-1',
        mockCallback
      );
      unsubscribe();

      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });
});

describe('ErrorHandler', () => {
  describe('handleApiError', () => {
    it('extracts message from error object', () => {
      const error = { message: 'Something went wrong' };
      const result = ErrorHandler.handleApiError(error);

      expect(result).toBe('Something went wrong');
    });

    it('extracts error_description from error object', () => {
      const error = { error_description: 'Database connection failed' };
      const result = ErrorHandler.handleApiError(error);

      expect(result).toBe('Database connection failed');
    });

    it('returns string error as-is', () => {
      const error = 'Simple error string';
      const result = ErrorHandler.handleApiError(error);

      expect(result).toBe('Simple error string');
    });

    it('returns default message for unknown errors', () => {
      const error = { code: 500 };
      const result = ErrorHandler.handleApiError(error);

      expect(result).toBe('An unexpected error occurred');
    });

    it('returns default message for null/undefined', () => {
      expect(ErrorHandler.handleApiError(null)).toBe(
        'An unexpected error occurred'
      );
      expect(ErrorHandler.handleApiError(undefined)).toBe(
        'An unexpected error occurred'
      );
    });

    it('returns default message for non-error objects', () => {
      const error = { status: 404, data: {} };
      const result = ErrorHandler.handleApiError(error);

      expect(result).toBe('An unexpected error occurred');
    });
  });

  describe('isNetworkError', () => {
    it('detects NetworkError by name', () => {
      const error = { name: 'NetworkError' };
      expect(ErrorHandler.isNetworkError(error)).toBe(true);
    });

    it('detects NETWORK_ERROR by code', () => {
      const error = { code: 'NETWORK_ERROR' };
      expect(ErrorHandler.isNetworkError(error)).toBe(true);
    });

    it('returns false for non-network errors', () => {
      const error = { message: 'Bad request' };
      expect(ErrorHandler.isNetworkError(error)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(ErrorHandler.isNetworkError(undefined)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('detects 401 status code', () => {
      const error = { status: 401 };
      expect(ErrorHandler.isAuthError(error)).toBe(true);
    });

    it('detects JWT in error message', () => {
      const error = { message: 'Invalid JWT token' };
      expect(ErrorHandler.isAuthError(error)).toBe(true);
    });

    it('detects JWT in error message case-insensitive', () => {
      const error = { message: 'jwt expired' };
      expect(ErrorHandler.isAuthError(error)).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      const error = { message: 'Resource not found' };
      expect(ErrorHandler.isAuthError(error)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(ErrorHandler.isAuthError(undefined)).toBe(false);
    });
  });
});
