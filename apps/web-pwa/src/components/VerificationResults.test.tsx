import { render, screen } from '@testing-library/react';
import VerificationResults from './VerificationResults';
import type { Certification } from '@wada-bmad/types';

describe('VerificationResults', () => {
  const mockCertifications: Certification[] = [
    {
      id: '1',
      name: 'NSF Certified',
      issuer: 'NSF International',
      valid_until: new Date('2025-12-31'),
      description: 'Certified for safety and quality',
    },
    {
      id: '2',
      name: 'GMP Certified',
      issuer: 'FDA',
      valid_until: new Date('2024-06-15'),
      description: 'Good Manufacturing Practices',
    },
  ];

  it('renders nothing when verificationResult is null', () => {
    const { container } = render(
      <VerificationResults verificationResult={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows loading state when verification is in progress', () => {
    const verificationResult = {
      verified: false,
      certifications: [],
      cached: false,
      loading: true,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Verification Results')).toBeInTheDocument();
    expect(
      screen.getByText('Verifying with certification databases...')
    ).toBeInTheDocument();
    expect(screen.getByRole('generic', { hidden: true })).toHaveClass(
      'animate-spin'
    );
  });

  it('shows verified status with green styling', () => {
    const verificationResult = {
      verified: true,
      certifications: mockCertifications,
      supplement: {
        name: 'Test Supplement',
        brand: 'Test Brand',
        description: 'A test supplement',
      },
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Certified Supplement')).toBeInTheDocument();
    expect(screen.getByText('Real-time verification')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows not verified status with red styling', () => {
    const verificationResult = {
      verified: false,
      certifications: [],
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Not Certified')).toBeInTheDocument();
    expect(screen.getByText('✗')).toBeInTheDocument();
  });

  it('shows cached results message', () => {
    const verificationResult = {
      verified: true,
      certifications: mockCertifications,
      cached: true,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Results from cache')).toBeInTheDocument();
  });

  it('displays certifications list', () => {
    const verificationResult = {
      verified: true,
      certifications: mockCertifications,
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Certifications:')).toBeInTheDocument();
    expect(screen.getByText('NSF Certified')).toBeInTheDocument();
    expect(screen.getByText('by NSF International')).toBeInTheDocument();
    expect(screen.getByText('GMP Certified')).toBeInTheDocument();
    expect(screen.getByText('by FDA')).toBeInTheDocument();
  });

  it('displays certification validity dates', () => {
    const verificationResult = {
      verified: true,
      certifications: mockCertifications,
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Valid until 12/31/2025')).toBeInTheDocument();
    expect(screen.getByText('Valid until 6/15/2024')).toBeInTheDocument();
  });

  it('shows error message when verification fails', () => {
    const verificationResult = {
      verified: false,
      certifications: [],
      cached: false,
      loading: false,
      error: 'Network error occurred',
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(
      screen.getByText('Verification error: Network error occurred')
    ).toBeInTheDocument();
  });

  it('handles certifications without validity dates', () => {
    const certificationsWithoutDates: Certification[] = [
      {
        id: '1',
        name: 'Basic Certification',
        issuer: 'Test Issuer',
        description: 'Basic certification',
      },
    ];

    const verificationResult = {
      verified: true,
      certifications: certificationsWithoutDates,
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Basic Certification')).toBeInTheDocument();
    expect(screen.getByText('by Test Issuer')).toBeInTheDocument();
    // Should not show validity date for certifications without dates
    expect(screen.queryByText(/Valid until/)).not.toBeInTheDocument();
  });

  it('renders empty certifications list gracefully', () => {
    const verificationResult = {
      verified: true,
      certifications: [],
      cached: false,
      loading: false,
    };

    render(<VerificationResults verificationResult={verificationResult} />);

    expect(screen.getByText('Verification Results')).toBeInTheDocument();
    expect(screen.queryByText('Certifications:')).not.toBeInTheDocument();
  });
});
