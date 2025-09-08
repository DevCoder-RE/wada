// Unit tests for useContentManagement hook

import { renderHook, act, waitFor } from '@testing-library/react';
import { useContentManagement } from './useContentManagement';
import {
  ContentManagementService,
  AffiliateTrackingService,
  AuthService,
} from '@wada-bmad/api-client';

// Mock the services
jest.mock('@wada-bmad/api-client', () => ({
  ContentManagementService: {
    getEducationalContent: jest.fn(),
    getContentCategories: jest.fn(),
    createEducationalContent: jest.fn(),
    updateEducationalContent: jest.fn(),
    deleteEducationalContent: jest.fn(),
    searchEducationalContent: jest.fn(),
    getRecommendedContent: jest.fn(),
    trackContentEngagement: jest.fn(),
  },
  AffiliateTrackingService: {
    getAffiliateLinks: jest.fn(),
    trackAffiliateClick: jest.fn(),
  },
  AuthService: {
    getCurrentUser: jest.fn(),
  },
}));

const mockContentManagementService = ContentManagementService as jest.Mocked<
  typeof ContentManagementService
>;
const mockAffiliateTrackingService = AffiliateTrackingService as jest.Mocked<
  typeof AffiliateTrackingService
>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('useContentManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useContentManagement());

      expect(result.current.content).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.affiliateLinks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadContent', () => {
    it('should load content successfully', async () => {
      const mockContent = [
        {
          id: '1',
          title: 'Test Article',
          content_type: 'article',
          status: 'published',
        },
      ];

      mockContentManagementService.getEducationalContent.mockResolvedValue({
        data: mockContent,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.loadContent();
      });

      expect(result.current.content).toEqual(mockContent);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle load content error', async () => {
      const errorMessage = 'Failed to load content';
      mockContentManagementService.getEducationalContent.mockResolvedValue({
        data: [],
        error: errorMessage,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.loadContent();
      });

      expect(result.current.content).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('loadCategories', () => {
    it('should load categories successfully', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Nutrition',
          description: 'Nutrition articles',
        },
      ];

      mockContentManagementService.getContentCategories.mockResolvedValue({
        data: mockCategories,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.loadCategories();
      });

      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.error).toBeNull();
    });
  });

  describe('loadAffiliateLinks', () => {
    it('should load affiliate links successfully', async () => {
      const mockAffiliateLinks = [
        {
          id: '1',
          name: 'Test Affiliate',
          partner_name: 'Test Partner',
          status: 'active',
        },
      ];

      mockAffiliateTrackingService.getAffiliateLinks.mockResolvedValue({
        data: mockAffiliateLinks,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.loadAffiliateLinks();
      });

      expect(result.current.affiliateLinks).toEqual(mockAffiliateLinks);
      expect(result.current.error).toBeNull();
    });
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      const newContent = {
        title: 'New Article',
        content: 'Article content',
        content_type: 'article' as const,
        category: 'nutrition',
        author_id: 'user-1',
      };

      const createdContent = { ...newContent, id: '1', created_at: new Date() };

      mockContentManagementService.createEducationalContent.mockResolvedValue({
        data: createdContent,
        error: undefined,
      });

      mockContentManagementService.getEducationalContent.mockResolvedValue({
        data: [createdContent],
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      let createdResult: any = null;
      await act(async () => {
        createdResult = await result.current.createContent(newContent);
      });

      expect(createdResult).toEqual(createdContent);
      expect(result.current.error).toBeNull();
    });

    it('should handle create content error', async () => {
      const errorMessage = 'Failed to create content';
      mockContentManagementService.createEducationalContent.mockResolvedValue({
        data: {} as any,
        error: errorMessage,
      });

      const { result } = renderHook(() => useContentManagement());

      let createdResult: any = null;
      await act(async () => {
        createdResult = await result.current.createContent({
          title: 'Test',
          content_type: 'article' as const,
          category: 'test',
        });
      });

      expect(createdResult).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('updateContent', () => {
    it('should update content successfully', async () => {
      const existingContent = {
        id: '1',
        title: 'Original Title',
        content_type: 'article' as const,
        category: 'nutrition',
      };

      const updatedContent = {
        ...existingContent,
        title: 'Updated Title',
      };

      mockContentManagementService.updateEducationalContent.mockResolvedValue({
        data: updatedContent,
        error: undefined,
      });

      const { result } = renderHook(() =>
        useContentManagement({ autoLoad: false })
      );

      // Set initial content
      act(() => {
        result.current.content = [existingContent];
      });

      let updatedResult: any = null;
      await act(async () => {
        updatedResult = await result.current.updateContent('1', {
          title: 'Updated Title',
        });
      });

      expect(updatedResult).toEqual(updatedContent);
      expect(result.current.content[0].title).toBe('Updated Title');
      expect(result.current.error).toBeNull();
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      const contentToDelete = {
        id: '1',
        title: 'Test Article',
        content_type: 'article' as const,
        category: 'nutrition',
      };

      mockContentManagementService.deleteEducationalContent.mockResolvedValue({
        data: null,
        error: undefined,
      });

      const { result } = renderHook(() =>
        useContentManagement({ autoLoad: false })
      );

      // Set initial content
      act(() => {
        result.current.content = [contentToDelete];
      });

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteContent('1');
      });

      expect(deleteResult).toBe(true);
      expect(result.current.content).toHaveLength(0);
      expect(result.current.error).toBeNull();
    });
  });

  describe('searchContent', () => {
    it('should search content successfully', async () => {
      const searchResults = [
        {
          id: '1',
          title: 'Nutrition Guide',
          content_type: 'article' as const,
          category: 'nutrition',
        },
      ];

      mockContentManagementService.searchEducationalContent.mockResolvedValue({
        data: searchResults,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      let searchResult: any[] = [];
      await act(async () => {
        searchResult = await result.current.searchContent('nutrition');
      });

      expect(searchResult).toEqual(searchResults);
      expect(result.current.error).toBeNull();
    });
  });

  describe('getRecommendedContent', () => {
    it('should get recommended content successfully', async () => {
      const recommendedContent = [
        {
          id: '1',
          title: 'Recommended Article',
          content_type: 'article' as const,
          category: 'nutrition',
        },
      ];

      mockContentManagementService.getRecommendedContent.mockResolvedValue({
        data: recommendedContent,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      let recommendedResult: any[] = [];
      await act(async () => {
        recommendedResult =
          await result.current.getRecommendedContent('user-1');
      });

      expect(recommendedResult).toEqual(recommendedContent);
      expect(result.current.error).toBeNull();
    });
  });

  describe('trackEngagement', () => {
    it('should track engagement without errors', async () => {
      mockContentManagementService.trackContentEngagement.mockResolvedValue({
        data: {} as any,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.trackEngagement({
          user_id: 'user-1',
          content_id: 'content-1',
          engagement_type: 'view',
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('trackAffiliateClick', () => {
    it('should track affiliate click successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockAffiliateTrackingService.trackAffiliateClick.mockResolvedValue({
        data: 'click-id',
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.trackAffiliateClick('affiliate-1', 'content-1');
      });

      expect(
        mockAffiliateTrackingService.trackAffiliateClick
      ).toHaveBeenCalledWith('affiliate-1', 'user-1', 'content-1');
      expect(result.current.error).toBeNull();
    });
  });

  describe('refresh', () => {
    it('should refresh all data', async () => {
      const mockContent = [{ id: '1', title: 'Test' }];
      const mockCategories = [{ id: '1', name: 'Test Category' }];
      const mockAffiliateLinks = [{ id: '1', name: 'Test Affiliate' }];

      mockContentManagementService.getEducationalContent.mockResolvedValue({
        data: mockContent,
        error: undefined,
      });

      mockContentManagementService.getContentCategories.mockResolvedValue({
        data: mockCategories,
        error: undefined,
      });

      mockAffiliateTrackingService.getAffiliateLinks.mockResolvedValue({
        data: mockAffiliateLinks,
        error: undefined,
      });

      const { result } = renderHook(() => useContentManagement());

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.content).toEqual(mockContent);
      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.affiliateLinks).toEqual(mockAffiliateLinks);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() =>
        useContentManagement({ autoLoad: false })
      );

      // Set an error
      act(() => {
        (result.current as any).error = 'Test error';
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('autoLoad', () => {
    it('should load data automatically when autoLoad is true', async () => {
      const mockContent = [{ id: '1', title: 'Auto-loaded content' }];

      mockContentManagementService.getEducationalContent.mockResolvedValue({
        data: mockContent,
        error: undefined,
      });

      mockContentManagementService.getContentCategories.mockResolvedValue({
        data: [],
        error: undefined,
      });

      mockAffiliateTrackingService.getAffiliateLinks.mockResolvedValue({
        data: [],
        error: undefined,
      });

      const { result } = renderHook(() =>
        useContentManagement({ autoLoad: true })
      );

      await waitFor(() => {
        expect(result.current.content).toEqual(mockContent);
      });

      expect(
        mockContentManagementService.getEducationalContent
      ).toHaveBeenCalled();
      expect(
        mockContentManagementService.getContentCategories
      ).toHaveBeenCalled();
      expect(mockAffiliateTrackingService.getAffiliateLinks).toHaveBeenCalled();
    });
  });
});
