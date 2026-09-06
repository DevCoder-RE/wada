import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthService, DatabaseService } from '@wada-bmad/api-client';

jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
  },
  DatabaseService: {
    getAthleteProfile: jest.fn(),
    getLogbookEntries: jest.fn(),
  },
}));

jest.mock('@wada-bmad/utils', () => ({
  formatDateTime: jest.fn((date: Date) => date.toLocaleDateString()),
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockDatabaseService = DatabaseService as jest.Mocked<
  typeof DatabaseService
>;

const mockProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  sport: 'Swimming',
  created_at: new Date(),
  updated_at: new Date(),
};

const mockEntries = [
  {
    id: 'entry-1',
    athlete_id: 'user-1',
    supplement_id: 'supp-1',
    amount: 25,
    unit: 'g',
    timestamp: new Date(),
    verified: true,
  },
  {
    id: 'entry-2',
    athlete_id: 'user-1',
    supplement_id: 'supp-2',
    amount: 5,
    unit: 'mg',
    timestamp: new Date(Date.now() - 86400000 * 3),
    verified: false,
  },
];

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner initially', async () => {
    mockAuthService.getCurrentUser.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderDashboard();

    expect(
      screen.getAllByRole('generic').some((el) =>
        el.className.includes('animate-spin')
      )
    ).toBe(true);
  });

  it('displays welcome message with user name', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John Doe/)).toBeInTheDocument();
    });
  });

  it('displays welcome message with default name when no profile', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: null,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Athlete/)).toBeInTheDocument();
    });
  });

  it('displays total entries stat', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Entries')).toBeInTheDocument();
      expect(
        screen.getByText('Total Entries').closest('div')
      ).toHaveTextContent('2');
    });
  });

  it('displays this week stat', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('This Week')).toBeInTheDocument();
    });
  });

  it('displays verified count stat', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      const verifiedLabel = screen.getByText('Verified', {
        selector: 'dt',
      });
      expect(verifiedLabel).toBeInTheDocument();
      expect(verifiedLabel.closest('div')).toHaveTextContent('1');
    });
  });

  it('displays quick actions section', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Scan Supplement')).toBeInTheDocument();
      expect(screen.getByText('View Logbook')).toBeInTheDocument();
    });
  });

  it('renders scan supplement link correctly', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      const scanLink = screen.getByText('Scan Supplement').closest('a');
      expect(scanLink).toHaveAttribute('href', '/scanner');
    });
  });

  it('renders view logbook link correctly', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      const logbookLink = screen.getByText('View Logbook').closest('a');
      expect(logbookLink).toHaveAttribute('href', '/logbook');
    });
  });

  it('displays recent activity section', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('displays verified badge for verified entries', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      const verifiedBadges = screen.getAllByText('Verified');
      expect(verifiedBadges.length).toBeGreaterThan(0);
    });
  });

  it('displays pending badge for unverified entries', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('displays empty state when no entries', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('No recent activity. Start by scanning a supplement!')
      ).toBeInTheDocument();
    });
  });

  it('displays track message for entries', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: mockEntries,
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText('Supplement logged')).toHaveLength(2);
    });
  });

  it('handles profile load error gracefully', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockRejectedValue(
      new Error('Network error')
    );
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
    });
  });

  it('handles entries load error gracefully', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockRejectedValue(
      new Error('Network error')
    );

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/)).toBeInTheDocument();
      expect(screen.getByText('Total Entries')).toBeInTheDocument();
    });
  });

  it('displays app tagline', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'john@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.getLogbookEntries.mockResolvedValue({
      data: [],
    } as any);

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Track your supplement intake and maintain WADA compliance/
        )
      ).toBeInTheDocument();
    });
  });
});
