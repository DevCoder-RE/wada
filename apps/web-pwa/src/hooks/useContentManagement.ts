import { useState, useEffect, useCallback } from 'react';
import {
  ContentManagementService,
  AffiliateTrackingService,
  AuthService,
} from '@wada-bmad/api-client';
import type {
  EducationalContent,
  ContentCategory,
  AffiliateLink,
  ApiResponse,
} from '@wada-bmad/types';

interface UseContentManagementOptions {
  autoLoad?: boolean;
  filters?: {
    category?: string;
    status?: string;
    authorId?: string;
    limit?: number;
  };
}

interface UseContentManagementReturn {
  content: EducationalContent[];
  categories: ContentCategory[];
  affiliateLinks: AffiliateLink[];
  loading: boolean;
  error: string | null;
  loadContent: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadAffiliateLinks: () => Promise<void>;
  createContent: (
    content: Omit<
      EducationalContent,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'view_count'
      | 'like_count'
      | 'share_count'
    >
  ) => Promise<EducationalContent | null>;
  updateContent: (
    id: string,
    updates: Partial<EducationalContent>
  ) => Promise<EducationalContent | null>;
  deleteContent: (id: string) => Promise<boolean>;
  searchContent: (
    query: string,
    filters?: { category?: string; contentType?: string; limit?: number }
  ) => Promise<EducationalContent[]>;
  getRecommendedContent: (
    userId: string,
    limit?: number
  ) => Promise<EducationalContent[]>;
  trackEngagement: (
    engagement: Omit<
      import('@wada-bmad/types').ContentEngagement,
      'id' | 'created_at'
    >
  ) => Promise<void>;
  trackAffiliateClick: (
    affiliateLinkId: string,
    contentId?: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useContentManagement = (
  options: UseContentManagementOptions = {}
): UseContentManagementReturn => {
  const { autoLoad = false, filters = {} } = options;
  const { category, status, authorId, limit } = filters;

  const [content, setContent] = useState<EducationalContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result: ApiResponse<EducationalContent[]> =
        await ContentManagementService.getEducationalContent({
          category,
          status: status || 'published',
          authorId,
          limit,
        });

      if (result.error) {
        setError(result.error);
      } else {
        setContent(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [category, status, authorId, limit]);

  const loadCategories = useCallback(async () => {
    try {
      const result: ApiResponse<ContentCategory[]> =
        await ContentManagementService.getContentCategories();

      if (result.error) {
        setError(result.error);
      } else {
        setCategories(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load categories'
      );
    }
  }, []);

  const loadAffiliateLinks = useCallback(async () => {
    try {
      const result: ApiResponse<AffiliateLink[]> =
        await AffiliateTrackingService.getAffiliateLinks({ status: 'active' });

      if (result.error) {
        setError(result.error);
      } else {
        setAffiliateLinks(result.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load affiliate links'
      );
    }
  }, []);

  const createContent = useCallback(
    async (
      contentData: Omit<
        EducationalContent,
        | 'id'
        | 'created_at'
        | 'updated_at'
        | 'view_count'
        | 'like_count'
        | 'share_count'
      >
    ): Promise<EducationalContent | null> => {
      try {
        setError(null);

        const result: ApiResponse<EducationalContent> =
          await ContentManagementService.createEducationalContent(contentData);

        if (result.error) {
          setError(result.error);
          return null;
        } else {
          await loadContent();
          return result.data;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create content';
        setError(errorMessage);
        return null;
      }
    },
    [loadContent]
  );

  const updateContent = useCallback(
    async (
      id: string,
      updates: Partial<EducationalContent>
    ): Promise<EducationalContent | null> => {
      try {
        setError(null);

        const result: ApiResponse<EducationalContent> =
          await ContentManagementService.updateEducationalContent(id, updates);

        if (result.error) {
          setError(result.error);
          return null;
        } else {
          setContent((prev) =>
            prev.map((item) => (item.id === id ? result.data : item))
          );
          return result.data;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update content';
        setError(errorMessage);
        return null;
      }
    },
    []
  );

  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const result: ApiResponse<null> =
        await ContentManagementService.deleteEducationalContent(id);

      if (result.error) {
        setError(result.error);
        return false;
      } else {
        setContent((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete content';
      setError(errorMessage);
      return false;
    }
  }, []);

  const searchContent = useCallback(
    async (
      query: string,
      searchFilters?: {
        category?: string;
        contentType?: string;
        limit?: number;
      }
    ): Promise<EducationalContent[]> => {
      try {
        setError(null);

        const result: ApiResponse<EducationalContent[]> =
          await ContentManagementService.searchEducationalContent(
            query,
            searchFilters
          );

        if (result.error) {
          setError(result.error);
          return [];
        } else {
          return result.data;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to search content';
        setError(errorMessage);
        return [];
      }
    },
    []
  );

  const getRecommendedContent = useCallback(
    async (userId: string, limit = 10): Promise<EducationalContent[]> => {
      try {
        setError(null);

        const result: ApiResponse<EducationalContent[]> =
          await ContentManagementService.getRecommendedContent(userId, limit);

        if (result.error) {
          setError(result.error);
          return [];
        } else {
          return result.data;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to get recommended content';
        setError(errorMessage);
        return [];
      }
    },
    []
  );

  const trackEngagement = useCallback(
    async (
      engagement: Omit<
        import('@wada-bmad/types').ContentEngagement,
        'id' | 'created_at'
      >
    ): Promise<void> => {
      try {
        await ContentManagementService.trackContentEngagement(engagement);
      } catch (err) {
        console.warn('Failed to track engagement:', err);
      }
    },
    []
  );

  const trackAffiliateClick = useCallback(
    async (affiliateLinkId: string, contentId?: string): Promise<void> => {
      try {
        const user = await AuthService.getCurrentUser();
        await AffiliateTrackingService.trackAffiliateClick(
          affiliateLinkId,
          user?.id,
          contentId
        );
      } catch (err) {
        console.warn('Failed to track affiliate click:', err);
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await Promise.all([loadContent(), loadCategories(), loadAffiliateLinks()]);
  }, [loadContent, loadCategories, loadAffiliateLinks]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    content,
    categories,
    affiliateLinks,
    loading,
    error,
    loadContent,
    loadCategories,
    loadAffiliateLinks,
    createContent,
    updateContent,
    deleteContent,
    searchContent,
    getRecommendedContent,
    trackEngagement,
    trackAffiliateClick,
    refresh,
    clearError,
  };
};
