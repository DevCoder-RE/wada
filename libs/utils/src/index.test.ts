import {
  formatDate,
  formatDateTime,
  isValidDate,
  parseDate,
  capitalize,
  capitalizeWords,
  formatName,
  slugify,
  isValidBarcode,
  formatBarcode,
  parseBarcode,
  isCertificationValid,
  getCertificationStatus,
  formatCertificationDate,
} from './index';

describe('Date utilities', () => {
  test('formatDate returns YYYY-MM-DD format', () => {
    const date = new Date('2023-12-25');
    expect(formatDate(date)).toBe('2023-12-25');
  });

  test('isValidDate returns true for valid dates', () => {
    expect(isValidDate(new Date())).toBe(true);
  });

  test('isValidDate returns false for invalid dates', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false);
  });

  test('parseDate returns Date for valid string', () => {
    const result = parseDate('2023-12-25');
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString().split('T')[0]).toBe('2023-12-25');
  });

  test('parseDate returns null for invalid string', () => {
    expect(parseDate('invalid')).toBeNull();
  });
});

describe('String utilities', () => {
  test('capitalize capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  test('capitalizeWords capitalizes each word', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
  });

  test('formatName formats first and last name', () => {
    expect(formatName('john', 'doe')).toBe('John Doe');
  });

  test('slugify converts to slug format', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
  });
});

describe('Barcode utilities', () => {
  test('isValidBarcode validates EAN-13', () => {
    expect(isValidBarcode('1234567890123')).toBe(true);
  });

  test('isValidBarcode validates UPC', () => {
    expect(isValidBarcode('123456789012')).toBe(true);
  });

  test('isValidBarcode rejects invalid barcodes', () => {
    expect(isValidBarcode('123')).toBe(false);
  });

  test('formatBarcode formats EAN-13', () => {
    expect(formatBarcode('1234567890123')).toBe('123-4567-890123');
  });

  test('parseBarcode removes formatting', () => {
    expect(parseBarcode('123-4567-890123')).toBe('1234567890123');
  });
});

describe('Certification utilities', () => {
  test('isCertificationValid returns true for future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(isCertificationValid(futureDate)).toBe(true);
  });

  test('isCertificationValid returns false for past dates', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(isCertificationValid(pastDate)).toBe(false);
  });

  test('getCertificationStatus returns valid for future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(getCertificationStatus(futureDate)).toBe('valid');
  });

  test('getCertificationStatus returns expired for past dates', () => {
    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);
    expect(getCertificationStatus(pastDate)).toBe('expired');
  });
});