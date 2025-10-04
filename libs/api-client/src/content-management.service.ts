// Content Management Service for educational content and affiliate tracking

import { supabase } from './index';
import type {
  EducationalContent,
  ContentCategory,
  AffiliateLink,
  ContentEngagement,
  ContentAnalytics,
  AffiliateClick,
  AffiliateConversion,
  ApiResponse,
} from '@wada-bmad/types';

export class ContentManagementService {
  // Educational Content CRUD Operations

  static async getEducationalContent(filters?: {
    category?: string;
    status?: string;
    authorId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<EducationalContent[]>> {
    try {
      let query = supabase
        .from('educational_content')
        .select(
          `
          *,
          author:author_id(id, email),
          categories:content_categories(name)
        `
        )
        .order('published_at', { ascending: false, nullsFirst: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.authorId) {
        query = query.eq('author_id', filters.authorId);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch educational content',
      };
    }
  }

  static async getEducationalContentById(
    id: string
  ): Promise<ApiResponse<EducationalContent>> {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .select(
          `
          *,
          author:author_id(id, email),
          categories:content_categories(name),
          affiliate_links:content_affiliate_links(
            affiliate_links(*)
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      // Increment view count
      await supabase.rpc('increment_content_views', { content_uuid: id });

      return { data };
    } catch (error) {
      return {
        data: {} as EducationalContent,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch educational content',
      };
    }
  }

  static async createEducationalContent(
    content: Omit<
      EducationalContent,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'view_count'
      | 'like_count'
      | 'share_count'
    >
  ): Promise<ApiResponse<EducationalContent>> {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .insert(content)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as EducationalContent,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create educational content',
      };
    }
  }

  static async updateEducationalContent(
    id: string,
    updates: Partial<EducationalContent>
  ): Promise<ApiResponse<EducationalContent>> {
    try {
      const { data, error } = await supabase
        .from('educational_content')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as EducationalContent,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update educational content',
      };
    }
  }

  static async deleteEducationalContent(
    id: string
  ): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('educational_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: null };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete educational content',
      };
    }
  }

  // Content Categories

  static async getContentCategories(): Promise<ApiResponse<ContentCategory[]>> {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch content categories',
      };
    }
  }

  static async createContentCategory(
    category: Omit<ContentCategory, 'id' | 'created_at'>
  ): Promise<ApiResponse<ContentCategory>> {
    try {
      const { data, error } = await supabase
        .from('content_categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as ContentCategory,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create content category',
      };
    }
  }

  // Affiliate Links Management

  static async getAffiliateLinks(filters?: {
    status?: string;
    partnerName?: string;
    limit?: number;
  }): Promise<ApiResponse<AffiliateLink[]>> {
    try {
      let query = supabase
        .from('affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.partnerName) {
        query = query.ilike('partner_name', `%${filters.partnerName}%`);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch affiliate links',
      };
    }
  }

  static async createAffiliateLink(
    link: Omit<
      AffiliateLink,
      | 'id'
      | 'created_at'
      | 'updated_at'
      | 'click_count'
      | 'conversion_count'
      | 'total_revenue'
    >
  ): Promise<ApiResponse<AffiliateLink>> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .insert(link)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AffiliateLink,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create affiliate link',
      };
    }
  }

  static async updateAffiliateLink(
    id: string,
    updates: Partial<AffiliateLink>
  ): Promise<ApiResponse<AffiliateLink>> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AffiliateLink,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update affiliate link',
      };
    }
  }

  static async trackAffiliateClick(
    affiliateLinkId: string,
    userId?: string,
    contentId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string,
    referrerUrl?: string
  ): Promise<ApiResponse<string>> {
    try {
      const { data, error } = await supabase.rpc('track_affiliate_click', {
        affiliate_uuid: affiliateLinkId,
        user_uuid: userId,
        content_uuid: contentId,
        session_text: sessionId,
        ip: ipAddress,
        agent: userAgent,
        referrer: referrerUrl,
      });

      if (error) throw error;

      return { data: data as string };
    } catch (error) {
      return {
        data: '',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to track affiliate click',
      };
    }
  }

  // Content Engagement Tracking

  static async trackContentEngagement(
    engagement: Omit<ContentEngagement, 'id' | 'created_at'>
  ): Promise<ApiResponse<ContentEngagement>> {
    try {
      const { data, error } = await supabase
        .from('user_content_engagement')
        .upsert(engagement, {
          onConflict: 'user_id,content_id,engagement_type',
        })
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as ContentEngagement,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to track content engagement',
      };
    }
  }

  static async getUserContentEngagement(
    userId: string,
    contentId?: string
  ): Promise<ApiResponse<ContentEngagement[]>> {
    try {
      let query = supabase
        .from('user_content_engagement')
        .select('*')
        .eq('user_id', userId);

      if (contentId) {
        query = query.eq('content_id', contentId);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch user content engagement',
      };
    }
  }

  // Content Analytics

  static async getContentAnalytics(
    contentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<ContentAnalytics[]>> {
    try {
      let query = supabase
        .from('content_analytics')
        .select('*')
        .eq('content_id', contentId)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch content analytics',
      };
    }
  }

  // Content Search

  static async searchEducationalContent(
    query: string,
    filters?: {
      category?: string;
      contentType?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<EducationalContent[]>> {
    try {
      let searchQuery = supabase
        .from('educational_content')
        .select(
          `
          *,
          author:author_id(id, email),
          categories:content_categories(name)
        `
        )
        .eq('status', 'published')
        .or(
          `title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`
        )
        .order('published_at', { ascending: false });

      if (filters?.category) {
        searchQuery = searchQuery.eq('category', filters.category);
      }

      if (filters?.contentType) {
        searchQuery = searchQuery.eq('content_type', filters.contentType);
      }

      if (filters?.limit) {
        searchQuery = searchQuery.limit(filters.limit);
      }

      const { data, error } = await searchQuery;

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to search educational content',
      };
    }
  }

  // Content Recommendations

  static async getRecommendedContent(
    userId: string,
    limit = 10
  ): Promise<ApiResponse<EducationalContent[]>> {
    try {
      // Get user's engagement history
      const { data: engagementData, error: engagementError } = await supabase
        .from('user_content_engagement')
        .select('content_id, engagement_type')
        .eq('user_id', userId);

      if (engagementError) throw engagementError;

      // Get user's preferred categories based on engagement
      const preferredCategories =
        engagementData
          ?.filter(
            (e) =>
              e.engagement_type === 'view' || e.engagement_type === 'complete'
          )
          .map((e) => e.content_id) || [];

      if (preferredCategories.length === 0) {
        // Return featured content if no engagement history
        const { data, error } = await supabase
          .from('educational_content')
          .select(
            `
            *,
            author:author_id(id, email),
            categories:content_categories(name)
          `
          )
          .eq('status', 'published')
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error) throw error;
        return { data: data || [] };
      }

      // Get categories from user's viewed content
      const { data: categoryData, error: categoryError } = await supabase
        .from('educational_content')
        .select('category')
        .in('id', preferredCategories);

      if (categoryError) throw categoryError;

      const categories = [
        ...new Set(categoryData?.map((c) => c.category) || []),
      ];

      // Recommend content from preferred categories
      const { data, error } = await supabase
        .from('educational_content')
        .select(
          `
          *,
          author:author_id(id, email),
          categories:content_categories(name)
        `
        )
        .eq('status', 'published')
        .in('category', categories)
        .not(
          'id',
          'in',
          `(${preferredCategories.map((id) => `'${id}'`).join(',')})`
        )
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { data: data || [] };
    } catch (error) {
      return {
        data: [],
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get recommended content',
      };
    }
  }
}
