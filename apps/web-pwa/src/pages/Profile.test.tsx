import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import { AuthService, DatabaseService } from '@wada-bmad/api-client';
import type { AthleteProfile } from '@wada-bmad/types';

jest.mock('@wada-bmad/api-client', () => ({
  AuthService: {
    getCurrentUser: jest.fn(),
    signOut: jest.fn(),
  },
  DatabaseService: {
    getAthleteProfile: jest.fn(),
    updateAthleteProfile: jest.fn(),
  },
}));

const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;
const mockDatabaseService = DatabaseService as jest.Mocked<
  typeof DatabaseService
>;

const mockProfile: AthleteProfile = {
  id: 'profile-1',
  user_id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  date_of_birth: new Date('1990-05-15'),
  sport: 'Swimming',
  team: 'Olympic Team',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loading spinner while fetching profile', () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockImplementation(
      () => new Promise(() => {})
    );

    render(<Profile />);

    expect(screen.getByRole('generic')).toHaveClass('animate-spin');
  });

  it('displays profile information when loaded', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Swimming')).toBeInTheDocument();
      expect(screen.getByText('Olympic Team')).toBeInTheDocument();
    });
  });

  it('displays "Not set" for empty fields', async () => {
    const incompleteProfile = { ...mockProfile, name: '', sport: '' };

    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: incompleteProfile,
    } as any);

    render(<Profile />);

    await waitFor(() => {
      const notSetElements = screen.getAllByText('Not set');
      expect(notSetElements.length).toBeGreaterThan(0);
    });
  });

  it('enters edit mode when Edit button is clicked', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
  });

  it('exits edit mode when Cancel is clicked', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  it('calls updateAthleteProfile when Save is clicked', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.updateAthleteProfile.mockResolvedValue({
      data: { ...mockProfile, name: 'Jane Doe' },
    } as any);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockDatabaseService.updateAthleteProfile).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'john@example.com',
          sport: 'Swimming',
          team: 'Olympic Team',
        })
      );
    });
  });

  it('shows alert when update fails', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockDatabaseService.updateAthleteProfile.mockResolvedValue({
      error: 'Failed to update profile',
    } as any);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to save profile: Failed to update profile'
      );
    });
  });

  it('shows alert when user is not logged in', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'You must be logged in to update your profile'
      );
    });
  });

  it('handles sign out', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockResolvedValue({
      data: mockProfile,
    } as any);
    mockAuthService.signOut.mockResolvedValue({ data: null });

    const reloadSpy = jest
      .spyOn(location, 'reload')
      .mockImplementation(() => {});

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(mockAuthService.signOut).toHaveBeenCalled();
    });

    reloadSpy.mockRestore();
  });

  it('handles API errors during profile fetch', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
    } as any);
    mockDatabaseService.getAthleteProfile.mockRejectedValue(
      new Error('Network error')
    );

    render(<Profile />);

    await waitFor(() => {
      const spinner = screen.queryByRole('generic');
      expect(spinner).not.toBeInTheDocument();
    });
  });
});
