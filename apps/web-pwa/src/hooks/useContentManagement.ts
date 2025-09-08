// React hook for content management functionality

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
  ContentEngagement,
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
  // Content data
  content: EducationalContent[];
  categories: ContentCategory[];
  affiliateLinks: AffiliateLink[];
  loading: boolean;
  error: string | null;

  // Content operations
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
    filters?: any
  ) => Promise<EducationalContent[]>;
  getRecommendedContent: (
    userId: string,
    limit?: number
  ) => Promise<EducationalContent[]>;

  // Engagement tracking
  trackEngagement: (
    engagement: Omit<ContentEngagement, 'id' | 'created_at'>
  ) => Promise<void>;
  trackAffiliateClick: (
    affiliateLinkId: string,
    contentId?: string
  ) => Promise<void>;

  // Utility functions
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useContentManagement = (
  options: UseContentManagementOptions = {}
): UseContentManagementReturn => {
  const { autoLoad = false, filters = {} } = options;

  // State
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load content
  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result: ApiResponse<EducationalContent[]> =
        await ContentManagementService.getEducationalContent(filters);

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
  }, [filters]);

  // Load categories
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

  // Load affiliate links
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

  // Create content
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
          // Refresh content list
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

  // Update content
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
          // Update local state
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

  // Delete content
  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      const result: ApiResponse<null> =
        await ContentManagementService.deleteEducationalContent(id);

      if (result.error) {
        setError(result.error);
        return false;
      } else {
        // Remove from local state
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

  // Search content
  const searchContent = useCallback(
    async (
      query: string,
      searchFilters?: any
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

  // Get recommended content
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

  // Track engagement
  const trackEngagement = useCallback(
    async (
      engagement: Omit<ContentEngagement, 'id' | 'created_at'>
    ): Promise<void> => {
      try {
        await ContentManagementService.trackContentEngagement(engagement);
      } catch (err) {
        // Don't set error for tracking failures to avoid disrupting UX
        console.warn('Failed to track engagement:', err);
      }
    },
    []
  );

  // Track affiliate click
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
        // Don't set error for tracking failures to avoid disrupting UX
        console.warn('Failed to track affiliate click:', err);
      }
    },
    []
  );

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([loadContent(), loadCategories(), loadAffiliateLinks()]);
  }, [loadContent, loadCategories, loadAffiliateLinks]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-load data on mount
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    // Data
    content,
    categories,
    affiliateLinks,
    loading,
    error,

    // Operations
    loadContent,
    loadCategories,
    loadAffiliateLinks,
    createContent,
    updateContent,
    deleteContent,
    searchContent,
    getRecommendedContent,

    // Engagement tracking
    trackEngagement,
    trackAffiliateClick,

    // Utilities
    refresh,
    clearError,
  };
};
