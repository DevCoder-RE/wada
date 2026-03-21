import { render, screen } from '@testing-library/react';
import RecentScans from './RecentScans';
import type { ScanHistoryEntry } from '@wada-bmad/types';

describe('RecentScans', () => {
  const mockScanHistory: ScanHistoryEntry[] = [
    {
      id: 'scan-1',
      barcode: '123456789012',
      supplementName: 'Whey Protein Isolate',
      brand: 'Optimum Nutrition',
      verified: true,
      scannedAt: new Date('2024-01-15T10:30:00'),
    },
    {
      id: 'scan-2',
      barcode: '123456789013',
      supplementName: 'Creatine Monohydrate',
      brand: 'MuscleTech',
      verified: false,
      scannedAt: new Date('2024-01-15T09:15:00'),
    },
    {
      id: 'scan-3',
      barcode: '999999999999',
      scannedAt: new Date('2024-01-14T14:00:00'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state when isLoading is true', () => {
    render(<RecentScans isLoading={true} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    const container = screen.getByText('Recent Scans').closest('.bg-white');
    expect(container).toHaveClass('animate-pulse');
  });

  it('displays scan history when available', () => {
    render(<RecentScans scanHistory={mockScanHistory} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('3 total')).toBeInTheDocument();
    expect(screen.getByText('Whey Protein Isolate')).toBeInTheDocument();
    expect(screen.getByText('Optimum Nutrition')).toBeInTheDocument();
  });

  it('displays "No recent scans" when scanHistory is empty', () => {
    render(<RecentScans scanHistory={[]} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('No recent scans')).toBeInTheDocument();
  });

  it('displays "No recent scans" when scanHistory is undefined', () => {
    render(<RecentScans scanHistory={undefined} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('No recent scans')).toBeInTheDocument();
  });

  it('limits displayed scans to 5 by default', () => {
    const manyScans = Array.from({ length: 10 }, (_, i) => ({
      id: `scan-${i}`,
      barcode: `123456789${String(i).padStart(3, '0')}`,
      scannedAt: new Date(Date.now() - i * 1000),
    }));

    render(<RecentScans scanHistory={manyScans} />);

    const items = screen.getAllByText(/123456789/);
    expect(items.length).toBe(5);
    expect(screen.getByText('5 of 10 scans')).toBeInTheDocument();
  });

  it('shows verified badge for verified scans', () => {
    render(<RecentScans scanHistory={mockScanHistory} />);

    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toHaveClass(
      'bg-green-100',
      'text-green-800'
    );
  });

  it('does not show verified badge for unverified scans', () => {
    render(<RecentScans scanHistory={mockScanHistory} />);

    const verifiedBadges = screen.getAllByText('Verified');
    expect(verifiedBadges.length).toBe(1);
  });

  it('displays barcode for scans without supplement name', () => {
    render(<RecentScans scanHistory={mockScanHistory} />);

    expect(screen.getAllByText('999999999999')[0]).toBeInTheDocument();
  });

  it('displays timestamp for each scan', () => {
    render(<RecentScans scanHistory={mockScanHistory} />);

    const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(timestamps.length).toBe(3);
  });

  it('handles scan without brand', () => {
    const scanWithoutBrand: ScanHistoryEntry = {
      id: 'scan-no-brand',
      barcode: '111111111111',
      scannedAt: new Date(),
    };

    render(<RecentScans scanHistory={[scanWithoutBrand]} />);

    expect(screen.getByText('111111111111')).toBeInTheDocument();
  });

  it('shows "0 total" when history is empty array', () => {
    render(<RecentScans scanHistory={[]} />);

    expect(screen.queryByText(/\d+ total/)).not.toBeInTheDocument();
  });
});
