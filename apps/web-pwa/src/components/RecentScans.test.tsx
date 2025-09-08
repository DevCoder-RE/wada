import { render, screen } from '@testing-library/react';
import RecentScans from './RecentScans';

describe('RecentScans', () => {
  it('displays last scanned barcode when available', () => {
    const lastScanned = '1234567890123';

    render(<RecentScans lastScanned={lastScanned} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('Last scanned:')).toBeInTheDocument();
    expect(screen.getByText('1234567890123')).toBeInTheDocument();
    expect(screen.getByText('1234567890123')).toHaveClass('font-mono');
  });

  it('shows no recent scans message when lastScanned is null', () => {
    render(<RecentScans lastScanned={null} />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('No recent scans')).toBeInTheDocument();
    expect(screen.queryByText('Last scanned:')).not.toBeInTheDocument();
  });

  it('shows no recent scans message when lastScanned is empty string', () => {
    render(<RecentScans lastScanned="" />);

    expect(screen.getByText('Recent Scans')).toBeInTheDocument();
    expect(screen.getByText('No recent scans')).toBeInTheDocument();
    expect(screen.queryByText('Last scanned:')).not.toBeInTheDocument();
  });

  it('handles different barcode formats', () => {
    const testCases = [
      '1234567890123', // EAN-13
      '012345678901', // UPC-A
      '12345678', // EAN-8
      'ABC123DEF456', // Code 128
    ];

    testCases.forEach((barcode) => {
      const { rerender } = render(<RecentScans lastScanned={barcode} />);
      expect(screen.getByText(barcode)).toBeInTheDocument();
      expect(screen.getByText(barcode)).toHaveClass('font-mono');
    });
  });

  it('maintains consistent styling', () => {
    const lastScanned = '9876543210987';

    render(<RecentScans lastScanned={lastScanned} />);

    const lastScannedText = screen.getByText('Last scanned:');
    expect(lastScannedText).toHaveClass('text-sm', 'text-gray-600');

    const barcodeText = screen.getByText('9876543210987');
    expect(barcodeText).toHaveClass('font-mono');
  });
});
