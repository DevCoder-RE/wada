import { render, screen, fireEvent } from '@testing-library/react';
import {
  SecureLogbookEntryComponent,
  ComplianceAlertComponent,
} from './SecureLogbookEntry';
import type { Supplement, Certification } from '@wada-bmad/types';

jest.mock('@wada-bmad/utils', () => ({
  formatDate: jest.fn((date: Date) => date.toLocaleDateString()),
}));

const mockSupplement: Supplement = {
  id: 'supp-1',
  name: 'Whey Protein Isolate',
  brand: 'Optimum Nutrition',
  ingredients: [],
  certifications: [],
  created_at: new Date(),
  updated_at: new Date(),
};

const mockEntry = {
  id: 'entry-12345678',
  athlete_id: 'user-1',
  supplementId: 'supp-1',
  amount: 25,
  unit: 'g',
  timestamp: new Date('2024-01-15'),
  verified: true,
  verification_data: {
    verification_method: 'barcode_scan',
    certifications: [],
    verified_at: new Date('2024-01-15'),
    verified_by: 'system',
  },
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
};

const mockCertification: Certification = {
  id: 'cert-1',
  name: 'NSF Certified for Sport',
  issuer: 'NSF International',
  type: 'NSF',
  valid_until: new Date('2025-12-31'),
  created_at: new Date(),
  updated_at: new Date(),
};

describe('SecureLogbookEntryComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders supplement name', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Whey Protein Isolate')).toBeInTheDocument();
  });

  it('renders supplement brand', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Optimum Nutrition')).toBeInTheDocument();
  });

  it('displays Unknown Supplement when no supplement provided', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={undefined}
      />
    );

    expect(screen.getByText('Unknown Supplement')).toBeInTheDocument();
  });

  it('displays verified badge when entry is verified', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('displays unverified badge when entry is not verified', () => {
    const unverifiedEntry = {
      ...mockEntry,
      verified: false,
      verification_data: undefined,
    };
    render(
      <SecureLogbookEntryComponent
        entry={unverifiedEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('displays entry amount and unit', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('25 g')).toBeInTheDocument();
  });

  it('displays verification method', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('BARCODE SCAN')).toBeInTheDocument();
  });

  it('displays Not Verified when no verification data', () => {
    const entry = {
      ...mockEntry,
      verified: false,
      verification_data: undefined,
    };
    render(
      <SecureLogbookEntryComponent
        entry={entry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Not Verified')).toBeInTheDocument();
  });

  it('displays notes when present', () => {
    const entryWithNotes = { ...mockEntry, notes: 'Post workout recovery' };
    render(
      <SecureLogbookEntryComponent
        entry={entryWithNotes as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Post workout recovery')).toBeInTheDocument();
  });

  it('displays default message when no notes', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('No notes provided')).toBeInTheDocument();
  });

  it('shows edit and delete buttons when editable', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
        isEditable={true}
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show edit/delete buttons when not editable', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
        isEditable={false}
      />
    );

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows verify button for unverified entries when editable', () => {
    const unverifiedEntry = {
      ...mockEntry,
      verified: false,
      verification_data: undefined,
    };
    render(
      <SecureLogbookEntryComponent
        entry={unverifiedEntry as any}
        supplement={mockSupplement}
        isEditable={true}
      />
    );

    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  it('does not show verify button for verified entries', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
        isEditable={true}
      />
    );

    expect(screen.queryByText('Verify')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit is clicked', () => {
    const onEdit = jest.fn();
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
        isEditable={true}
        onEdit={onEdit}
      />
    );

    fireEvent.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onDelete when delete is clicked', () => {
    const onDelete = jest.fn();
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
        isEditable={true}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith('entry-12345678');
  });

  it('displays entry ID', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText(/Entry ID:/)).toBeInTheDocument();
  });

  it('displays created date', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('shows verification details when clicked', () => {
    render(
      <SecureLogbookEntryComponent
        entry={mockEntry as any}
        supplement={mockSupplement}
      />
    );

    expect(screen.getByText('Show Verification Details')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Show Verification Details'));

    expect(screen.getByText('Hide Verification Details')).toBeInTheDocument();
  });

  it('displays certification list when verified', () => {
    const entryWithCerts = {
      ...mockEntry,
      verification_data: {
        ...mockEntry.verification_data,
        certifications: [mockCertification],
      },
    };

    render(
      <SecureLogbookEntryComponent
        entry={entryWithCerts as any}
        supplement={mockSupplement}
      />
    );

    fireEvent.click(screen.getByText('Show Verification Details'));

    expect(screen.getByText('NSF Certified for Sport')).toBeInTheDocument();
    expect(screen.getByText('NSF International')).toBeInTheDocument();
  });
});

describe('ComplianceAlertComponent', () => {
  it('renders high severity alert correctly', () => {
    const alert = {
      id: 'alert-1',
      severity: 'high' as const,
      message: 'Critical compliance issue',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} />);

    expect(screen.getByText('Critical compliance issue')).toBeInTheDocument();
    expect(screen.getByText('🚨')).toBeInTheDocument();
  });

  it('renders medium severity alert correctly', () => {
    const alert = {
      id: 'alert-1',
      severity: 'medium' as const,
      message: 'Warning: Low compliance rate',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} />);

    expect(
      screen.getByText('Warning: Low compliance rate')
    ).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders low severity alert correctly', () => {
    const alert = {
      id: 'alert-1',
      severity: 'low' as const,
      message: 'Information notice',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} />);

    expect(screen.getByText('Information notice')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('displays dismiss button when onDismiss provided', () => {
    const onDismiss = jest.fn();
    const alert = {
      id: 'alert-1',
      severity: 'low' as const,
      message: 'Dismissible alert',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} onDismiss={onDismiss} />);

    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = jest.fn();
    const alert = {
      id: 'alert-1',
      severity: 'low' as const,
      message: 'Dismissible alert',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('✕'));

    expect(onDismiss).toHaveBeenCalledWith('alert-1');
  });

  it('does not display dismiss button when onDismiss not provided', () => {
    const alert = {
      id: 'alert-1',
      severity: 'low' as const,
      message: 'Non-dismissible alert',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} />);

    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });

  it('displays entry ID when provided', () => {
    const alert = {
      id: 'alert-1',
      severity: 'low' as const,
      message: 'Alert with entry',
      entry_id: 'entry-12345678',
      created_at: new Date(),
    };

    render(<ComplianceAlertComponent alert={alert} />);

    expect(screen.getByText(/entry-12345678/)).toBeInTheDocument();
  });
});
