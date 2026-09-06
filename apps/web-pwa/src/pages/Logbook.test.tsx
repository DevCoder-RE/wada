import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Logbook from './Logbook';
import { useSecureLogbook } from '../hooks/useSecureLogbook';
import { AuthService, RealtimeService } from '@wada-bmad/api-client';

jest.mock('../hooks/useSecureLogbook');
jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
  },
  RealtimeService: {
    subscribeToLogbookUpdates: jest.fn(() => jest.fn()),
  },
}));

const mockUseSecureLogbook = useSecureLogbook as jest.MockedFunction<typeof useSecureLogbook>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockRealtimeService = RealtimeService as jest.Mocked<typeof RealtimeService>;

const mockSupplements = [
  {
    id: 'supp-1',
    name: 'Whey Protein',
    brand: 'Optimum Nutrition',
    ingredients: [],
    certifications: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'supp-2',
    name: 'Creatine',
    brand: 'MuscleTech',
    ingredients: [],
    certifications: [],
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const mockEntries = [
  {
    id: 'entry-1',
    athlete_id: 'user-1',
    supplementId: 'supp-1',
    amount: 25,
    unit: 'g',
    timestamp: new Date('2024-01-15'),
    verified: true,
    notes: 'Post workout',
    created_at: new Date(),
    updated_at: new Date(),
  },
];

const defaultMockReturn = {
  entries: [],
  supplements: [],
  complianceSummary: null,
  loading: false,
  error: null,
  createEntry: jest.fn(),
  updateEntry: jest.fn(),
  deleteEntry: jest.fn(),
  verifyEntry: jest.fn(),
  refreshData: jest.fn(),
  clearError: jest.fn(),
};

describe('Logbook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSecureLogbook.mockReturnValue(defaultMockReturn);
    mockAuthService.getCurrentUser.mockResolvedValue({ id: 'user-1', email: 'test@example.com' } as any);
    mockRealtimeService.subscribeToLogbookUpdates.mockReturnValue(jest.fn());
  });

  it('shows loading spinner while loading', () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      loading: true,
    });

    const { container } = render(<Logbook />);

    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });

  it('displays page title', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Supplement Logbook')).toBeInTheDocument();
    });
  });

  it('displays Add Entry button', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });
  });

  it('shows compliance summary when available', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: mockEntries,
      complianceSummary: {
        metrics: {
          total_entries: 10,
          verified_entries: 8,
          compliance_rate: 80,
          unique_supplements: 5,
        },
        alerts: [],
      },
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Compliance Summary')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('80.0%')).toBeInTheDocument();
    });
  });

  it('displays error message with dismiss button', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
      error: 'Failed to load entries',
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load entries')).toBeInTheDocument();
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  it('dismisses error when dismiss button is clicked', async () => {
    const clearError = jest.fn();
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
      error: 'Failed to load entries',
      clearError,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load entries')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('✕'));

    expect(clearError).toHaveBeenCalled();
  });

  it('displays search input', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search supplements or notes...')).toBeInTheDocument();
    });
  });

  it('displays date filter input', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByLabelText('Filter by Date')).toBeInTheDocument();
    });
  });

  it('shows add entry form when Add Entry is clicked', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
      supplements: mockSupplements,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Entry'));

    await waitFor(() => {
      expect(screen.getByText('Add New Entry')).toBeInTheDocument();
    });
  });

  it('displays empty state when no entries', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('No entries yet. Start by adding your first supplement entry!')).toBeInTheDocument();
    });
  });

  it('displays no match message when search returns empty', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: mockEntries,
      supplements: mockSupplements,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Whey Protein')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search supplements or notes...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText('No entries match your search criteria.')).toBeInTheDocument();
    });
  });

  it('displays entries when available', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: mockEntries,
      supplements: mockSupplements,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Whey Protein')).toBeInTheDocument();
    });
  });

  it('filters entries by search term', async () => {
    const entries = [
      ...mockEntries,
      {
        id: 'entry-2',
        athlete_id: 'user-1',
        supplementId: 'supp-2',
        amount: 5,
        unit: 'mg',
        timestamp: new Date(),
        verified: false,
        notes: 'Morning dose',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries,
      supplements: mockSupplements,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Whey Protein')).toBeInTheDocument();
      expect(screen.getByText('Creatine')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search supplements or notes...');
    fireEvent.change(searchInput, { target: { value: 'whey' } });

    await waitFor(() => {
      expect(screen.getByText('Whey Protein')).toBeInTheDocument();
      expect(screen.queryByText('Creatine')).not.toBeInTheDocument();
    });
  });

  it('calls createEntry when form is submitted', async () => {
    const createEntry = jest.fn();
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
      supplements: mockSupplements,
      createEntry,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Entry'));

    await waitFor(() => {
      expect(screen.getByText('Add New Entry')).toBeInTheDocument();
    });

    const select = screen.getByLabelText('Supplement *');
    fireEvent.change(select, { target: { value: 'supp-1' } });

    const amountInput = screen.getByLabelText('Amount *');
    fireEvent.change(amountInput, { target: { value: '30' } });

    fireEvent.click(screen.getAllByText('Add Entry')[1]);

    await waitFor(() => {
      expect(createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          supplementId: 'supp-1',
          amount: 30,
        })
      );
    });
  });

  it('validates required fields in add form', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
      supplements: mockSupplements,
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Add Entry')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Entry'));

    await waitFor(() => {
      expect(screen.getByText('Add New Entry')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    fireEvent.click(screen.getAllByText('Add Entry')[1]);

    // Form should not submit, no entry created
    expect(defaultMockReturn.createEntry).not.toHaveBeenCalled();
  });

  it('displays alerts when compliance issues exist', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: mockEntries,
      complianceSummary: {
        metrics: {
          total_entries: 10,
          verified_entries: 2,
          compliance_rate: 20,
          unique_supplements: 5,
        },
        alerts: [
          {
            id: 'alert-1',
            severity: 'high' as const,
            message: 'Low compliance rate detected',
            created_at: new Date(),
          },
        ],
      },
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(screen.getByText('Alerts')).toBeInTheDocument();
      expect(screen.getByText('Low compliance rate detected')).toBeInTheDocument();
    });
  });

  it('limits alerts display to 3', async () => {
    const alerts = Array.from({ length: 5 }, (_, i) => ({
      id: `alert-${i}`,
      severity: 'medium' as const,
      message: `Alert ${i}`,
      created_at: new Date(),
    }));

    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: mockEntries,
      complianceSummary: {
        metrics: {
          total_entries: 10,
          verified_entries: 5,
          compliance_rate: 50,
          unique_supplements: 5,
        },
        alerts,
      },
    });

    render(<Logbook />);

    await waitFor(() => {
      const alertMessages = screen.getAllByText(/Alert \d/);
      expect(alertMessages.length).toBe(3);
    });
  });

  it('sets up real-time subscription', async () => {
    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    render(<Logbook />);

    await waitFor(() => {
      expect(mockRealtimeService.subscribeToLogbookUpdates).toHaveBeenCalledWith(
        'user-1',
        expect.any(Function)
      );
    });
  });

  it('cleans up subscription on unmount', async () => {
    const unsubscribe = jest.fn();
    mockRealtimeService.subscribeToLogbookUpdates.mockReturnValue(unsubscribe);

    mockUseSecureLogbook.mockReturnValue({
      ...defaultMockReturn,
      entries: [],
    });

    const { unmount } = render(<Logbook />);

    await waitFor(() => {
      expect(mockRealtimeService.subscribeToLogbookUpdates).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
