// Shared utility functions

// Date formatting and validation
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isValidDate = (date: any): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

// String manipulation
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeWords = (str: string): string => {
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

export const formatName = (firstName: string, lastName: string): string => {
  return `${capitalize(firstName)} ${capitalize(lastName)}`;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Barcode parsing helpers
export const isValidBarcode = (barcode: string): boolean => {
  // Basic validation for common barcode formats
  const ean13Regex = /^\d{13}$/;
  const upcRegex = /^\d{12}$/;
  return ean13Regex.test(barcode) || upcRegex.test(barcode);
};

export const formatBarcode = (barcode: string): string => {
  if (!isValidBarcode(barcode)) return barcode;
  // Add hyphens for readability
  if (barcode.length === 13) {
    return `${barcode.slice(0, 3)}-${barcode.slice(3, 7)}-${barcode.slice(7)}`;
  }
  if (barcode.length === 12) {
    return `${barcode.slice(0, 1)}-${barcode.slice(1, 6)}-${barcode.slice(6)}`;
  }
  return barcode;
};

export const parseBarcode = (barcode: string): string => {
  // Remove any formatting characters
  return barcode.replace(/[-\s]/g, '');
};

// Certification validation functions
export const isCertificationValid = (validUntil?: Date): boolean => {
  if (!validUntil) return true; // If no expiry, consider valid
  return new Date() < validUntil;
};

export const getCertificationStatus = (validUntil?: Date): 'valid' | 'expiring' | 'expired' => {
  if (!validUntil) return 'valid';

  const now = new Date();
  const expiryDate = new Date(validUntil);
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= 30) return 'expiring';
  return 'valid';
};

export const formatCertificationDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};