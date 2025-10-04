// Unit tests for AffiliateTrackingService

import { AffiliateTrackingService } from './affiliate-tracking.service';
import { supabase } from './index';

// Mock Supabase client
jest.mock('./index', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            limit: jest.fn(),
            range: jest.fn(),
            gte: jest.fn(() => ({
              lte: jest.fn(),
            })),
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
        ilike: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(),
          })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(),
            })),
          })),
        })),
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(),
            })),
          })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(),
        })),
        rpc: jest.fn(),
        raw: jest.fn(),
      })),
    })),
  },
}));

describe('AffiliateTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAffiliateLinks', () => {
    it('should fetch affiliate links with filters', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Test Link',
          partner_name: 'Test Partner',
          status: 'active',
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              range: jest
                .fn()
                .mockResolvedValue({ data: mockData, error: null }),
            })),
          })),
        })),
      });

      const result = await AffiliateTrackingService.getAffiliateLinks({
        status: 'active',
        limit: 10,
      });

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest
              .fn()
              .mockResolvedValue({ data: null, error: mockError }),
          })),
        })),
      });

      const result = await AffiliateTrackingService.getAffiliateLinks();

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Failed to fetch affiliate links');
    });
  });

  describe('createAffiliateLink', () => {
    it('should create new affiliate link', async () => {
      const newLink = {
        name: 'New Affiliate Link',
        url: 'https://example.com',
        partner_name: 'Test Partner',
        commission_rate: 5.0,
        disclosure_text: 'Affiliate disclosure text',
        created_by: 'user-1',
      };

      const mockCreatedLink = { ...newLink, id: '1', created_at: new Date() };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockCreatedLink, error: null }),
          })),
        })),
      });

      const result =
        await AffiliateTrackingService.createAffiliateLink(newLink);

      expect(result.data).toEqual(mockCreatedLink);
      expect(result.error).toBeUndefined();
    });

    it('should handle creation errors', async () => {
      const mockError = { message: 'Validation error' };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: null, error: mockError }),
          })),
        })),
      });

      const result = await AffiliateTrackingService.createAffiliateLink({
        name: 'Test',
        url: 'https://example.com',
        partner_name: 'Test',
        commission_rate: 5.0,
        disclosure_text: 'Disclosure',
        created_by: 'user-1',
      });

      expect(result.data).toEqual({});
      expect(result.error).toBe('Failed to create affiliate link');
    });
  });

  describe('trackAffiliateClick', () => {
    it('should track affiliate click successfully', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        rpc: jest.fn().mockResolvedValue({ data: 'click-id-123', error: null }),
      });

      const result = await AffiliateTrackingService.trackAffiliateClick(
        'affiliate-1',
        'user-1',
        'content-1',
        'session-123'
      );

      expect(result.data).toBe('click-id-123');
      expect(result.error).toBeUndefined();
    });

    it('should handle tracking errors', async () => {
      const mockError = { message: 'Tracking failed' };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        rpc: jest.fn().mockResolvedValue({ data: '', error: mockError }),
      });

      const result =
        await AffiliateTrackingService.trackAffiliateClick('affiliate-1');

      expect(result.data).toBe('');
      expect(result.error).toBe('Failed to track affiliate click');
    });
  });

  describe('recordAffiliateConversion', () => {
    it('should record affiliate conversion', async () => {
      const conversion = {
        affiliate_link_id: 'affiliate-1',
        click_id: 'click-1',
        commission_amount: 25.5,
        order_id: 'order-123',
        status: 'pending' as const,
      };

      const mockRecordedConversion = {
        ...conversion,
        id: '1',
        converted_at: new Date(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.from
        .mockReturnValueOnce({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValue({
                  data: mockRecordedConversion,
                  error: null,
                }),
            })),
          })),
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ error: null }),
          })),
        });

      const result =
        await AffiliateTrackingService.recordAffiliateConversion(conversion);

      expect(result.data).toEqual(mockRecordedConversion);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getAffiliateAnalytics', () => {
    it('should return comprehensive analytics', async () => {
      const mockSummaryData = {
        click_count: 100,
        conversion_count: 10,
        total_revenue: 250.0,
      };

      const mockClicksData = [
        { clicked_at: '2024-01-01T10:00:00Z' },
        { clicked_at: '2024-01-02T10:00:00Z' },
      ];

      const mockConversionsData = [
        { converted_at: '2024-01-01T12:00:00Z', commission_amount: 25.0 },
        { converted_at: '2024-01-02T12:00:00Z', commission_amount: 30.0 },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest
              .fn()
              .mockResolvedValue({ data: mockSummaryData, error: null }),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest
                  .fn()
                  .mockResolvedValue({ data: mockClicksData, error: null }),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              gte: jest.fn(() => ({
                lte: jest
                  .fn()
                  .mockResolvedValue({
                    data: mockConversionsData,
                    error: null,
                  }),
              })),
            })),
          })),
        });

      const result =
        await AffiliateTrackingService.getAffiliateAnalytics('affiliate-1');

      expect(result.data.totalClicks).toBe(100);
      expect(result.data.totalConversions).toBe(10);
      expect(result.data.totalRevenue).toBe(250.0);
      expect(result.data.conversionRate).toBe(10);
      expect(result.data.averageCommission).toBe(25.0);
      expect(result.error).toBeUndefined();
    });
  });

  describe('validateAffiliateLink', () => {
    it('should validate valid affiliate link', () => {
      const validLink = {
        id: '1',
        name: 'Valid Link',
        url: 'https://example.com',
        partner_name: 'Test Partner',
        commission_rate: 5.0,
        disclosure_text: 'Affiliate disclosure',
        status: 'active' as const,
      };

      const result = AffiliateTrackingService.validateAffiliateLink(validLink);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate invalid affiliate link', () => {
      const invalidLink = {
        id: '1',
        name: '',
        url: 'invalid-url',
        partner_name: '',
        commission_rate: 150,
        disclosure_text: '',
        status: 'active' as const,
      };

      const result =
        AffiliateTrackingService.validateAffiliateLink(invalidLink);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Affiliate link name is required');
      expect(result.errors).toContain('Invalid affiliate URL format');
      expect(result.errors).toContain('Partner name is required');
      expect(result.errors).toContain(
        'Commission rate must be between 0 and 100'
      );
      expect(result.errors).toContain(
        'Disclosure text is required for compliance'
      );
    });
  });

  describe('bulkUpdateAffiliateLinks', () => {
    it('should update multiple affiliate links', async () => {
      const updates = [
        { id: '1', updates: { status: 'inactive' } },
        { id: '2', updates: { commission_rate: 7.5 } },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({ data: {}, error: null }),
            })),
          })),
        })),
      });

      const result =
        await AffiliateTrackingService.bulkUpdateAffiliateLinks(updates);

      expect(result.data.success).toBe(2);
      expect(result.data.failed).toBe(0);
      expect(result.data.errors).toHaveLength(0);
    });

    it('should handle partial failures in bulk update', async () => {
      const updates = [
        { id: '1', updates: { status: 'inactive' } },
        { id: '2', updates: { commission_rate: 7.5 } },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({ data: {}, error: null }),
              })),
            })),
          })),
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest
                  .fn()
                  .mockResolvedValue({
                    data: null,
                    error: { message: 'Update failed' },
                  }),
              })),
            })),
          })),
        });

      const result =
        await AffiliateTrackingService.bulkUpdateAffiliateLinks(updates);

      expect(result.data.success).toBe(1);
      expect(result.data.failed).toBe(1);
      expect(result.data.errors).toHaveLength(1);
    });
  });
});
