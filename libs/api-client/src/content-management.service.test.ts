// Unit tests for ContentManagementService

import { ContentManagementService } from './content-management.service';
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
          })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
        ilike: jest.fn(() => ({
          or: jest.fn(() => ({
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
      })),
    })),
  },
}));

describe('ContentManagementService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEducationalContent', () => {
    it('should fetch educational content with default parameters', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Test Content',
          content_type: 'article',
          status: 'published',
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(),
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                range: jest
                  .fn()
                  .mockResolvedValue({ data: mockData, error: null }),
              })),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          })),
        })),
      });

      const result = await ContentManagementService.getEducationalContent();

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

      const result = await ContentManagementService.getEducationalContent();

      expect(result.data).toEqual([]);
      expect(result.error).toBe('Failed to fetch educational content');
    });
  });

  describe('getEducationalContentById', () => {
    it('should fetch content by ID and increment view count', async () => {
      const mockData = {
        id: '1',
        title: 'Test Content',
        content: 'Test content body',
      };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockData, error: null }),
          })),
        })),
      });

      const result =
        await ContentManagementService.getEducationalContentById('1');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });

    it('should handle content not found', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
          })),
        })),
      });

      const result =
        await ContentManagementService.getEducationalContentById('999');

      expect(result.data).toEqual({});
      expect(result.error).toBe('Failed to fetch educational content');
    });
  });

  describe('createEducationalContent', () => {
    it('should create new educational content', async () => {
      const newContent = {
        title: 'New Article',
        content: 'Article content',
        content_type: 'article' as const,
        category: 'nutrition',
        author_id: 'user-1',
      };

      const mockCreatedContent = {
        ...newContent,
        id: '1',
        created_at: new Date(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockCreatedContent, error: null }),
          })),
        })),
      });

      const result =
        await ContentManagementService.createEducationalContent(newContent);

      expect(result.data).toEqual(mockCreatedContent);
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

      const result = await ContentManagementService.createEducationalContent({
        title: 'Test',
        content_type: 'article' as const,
        category: 'test',
      });

      expect(result.data).toEqual({});
      expect(result.error).toBe('Failed to create educational content');
    });
  });

  describe('updateEducationalContent', () => {
    it('should update existing content', async () => {
      const updates = { title: 'Updated Title' };
      const mockUpdatedContent = {
        id: '1',
        title: 'Updated Title',
        updated_at: new Date(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest
                .fn()
                .mockResolvedValue({ data: mockUpdatedContent, error: null }),
            })),
          })),
        })),
      });

      const result = await ContentManagementService.updateEducationalContent(
        '1',
        updates
      );

      expect(result.data).toEqual(mockUpdatedContent);
      expect(result.error).toBeUndefined();
    });
  });

  describe('deleteEducationalContent', () => {
    it('should delete content successfully', async () => {
      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null }),
        })),
      });

      const result =
        await ContentManagementService.deleteEducationalContent('1');

      expect(result.data).toBeNull();
      expect(result.error).toBeUndefined();
    });
  });

  describe('trackContentEngagement', () => {
    it('should track user engagement', async () => {
      const engagement = {
        user_id: 'user-1',
        content_id: 'content-1',
        engagement_type: 'view' as const,
      };

      const mockTrackedEngagement = {
        ...engagement,
        id: '1',
        created_at: new Date(),
      };

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        upsert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest
              .fn()
              .mockResolvedValue({ data: mockTrackedEngagement, error: null }),
          })),
        })),
      });

      const result =
        await ContentManagementService.trackContentEngagement(engagement);

      expect(result.data).toEqual(mockTrackedEngagement);
      expect(result.error).toBeUndefined();
    });
  });

  describe('searchEducationalContent', () => {
    it('should search content by query', async () => {
      const mockData = [
        {
          id: '1',
          title: 'Nutrition Guide',
          content: 'Learn about nutrition',
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              order: jest.fn(() => ({
                limit: jest
                  .fn()
                  .mockResolvedValue({ data: mockData, error: null }),
              })),
            })),
          })),
        })),
      });

      const result =
        await ContentManagementService.searchEducationalContent('nutrition');

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeUndefined();
    });
  });

  describe('getRecommendedContent', () => {
    it('should return recommended content based on user engagement', async () => {
      const mockEngagementData = [
        { content_id: 'content-1', engagement_type: 'view' },
        { content_id: 'content-2', engagement_type: 'complete' },
      ];

      const mockCategoryData = [
        { category: 'nutrition' },
        { category: 'training' },
      ];

      const mockRecommendedContent = [
        {
          id: 'content-3',
          title: 'Advanced Nutrition',
          category: 'nutrition',
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest
              .fn()
              .mockResolvedValue({ data: mockEngagementData, error: null }),
          })),
        })
        .mockReturnValueOnce({
          select: jest
            .fn()
            .mockResolvedValue({ data: mockCategoryData, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              in: jest.fn(() => ({
                not: jest.fn(() => ({
                  order: jest.fn(() => ({
                    limit: jest
                      .fn()
                      .mockResolvedValue({
                        data: mockRecommendedContent,
                        error: null,
                      }),
                  })),
                })),
              })),
            })),
          })),
        });

      const result =
        await ContentManagementService.getRecommendedContent('user-1');

      expect(result.data).toEqual(mockRecommendedContent);
      expect(result.error).toBeUndefined();
    });

    it('should return featured content when no engagement history', async () => {
      const mockFeaturedContent = [
        {
          id: 'featured-1',
          title: 'Featured Article',
          is_featured: true,
        },
      ];

      const mockSupabase = supabase as any;
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                order: jest.fn(() => ({
                  limit: jest
                    .fn()
                    .mockResolvedValue({
                      data: mockFeaturedContent,
                      error: null,
                    }),
                })),
              })),
            })),
          })),
        });

      const result =
        await ContentManagementService.getRecommendedContent('user-1');

      expect(result.data).toEqual(mockFeaturedContent);
      expect(result.error).toBeUndefined();
    });
  });
});
