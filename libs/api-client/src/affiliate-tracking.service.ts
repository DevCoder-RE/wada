// Affiliate Tracking Service for managing affiliate links and conversions

import { supabase } from './index';
import type {
  AffiliateLink,
  AffiliateClick,
  AffiliateConversion,
  ApiResponse,
} from '@wada-bmad/types';

export class AffiliateTrackingService {
  // Affiliate Link Management

  static async getAffiliateLinks(filters?: {
    status?: string;
    partnerName?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<AffiliateLink[]>> {
    try {
      let query = supabase
        .from('affiliate_links')
        .select(
          `
          *,
          creator:created_by(id, email)
        `
        )
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.partnerName) {
        query = query.ilike('partner_name', `%${filters.partnerName}%`);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
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
            : 'Failed to fetch affiliate links',
      };
    }
  }

  static async getAffiliateLinkById(
    id: string
  ): Promise<ApiResponse<AffiliateLink>> {
    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select(
          `
          *,
          creator:created_by(id, email),
          clicks:affiliate_clicks(count),
          conversions:affiliate_conversions(count)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      return {
        data: {} as AffiliateLink,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch affiliate link',
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

  static async deleteAffiliateLink(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('affiliate_links')
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
            : 'Failed to delete affiliate link',
      };
    }
  }

  // Click Tracking

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

  static async getAffiliateClicks(
    affiliateLinkId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<AffiliateClick[]>> {
    try {
      let query = supabase
        .from('affiliate_clicks')
        .select(
          `
          *,
          user:user_id(id, email),
          content:content_id(title),
          affiliate_link:affiliate_link_id(name)
        `
        )
        .eq('affiliate_link_id', affiliateLinkId)
        .order('clicked_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('clicked_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('clicked_at', filters.endDate.toISOString());
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
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
            : 'Failed to fetch affiliate clicks',
      };
    }
  }

  // Conversion Tracking

  static async recordAffiliateConversion(
    conversion: Omit<AffiliateConversion, 'id' | 'converted_at'>
  ): Promise<ApiResponse<AffiliateConversion>> {
    try {
      const { data, error } = await supabase
        .from('affiliate_conversions')
        .insert({
          ...conversion,
          converted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update affiliate link conversion count and revenue
      await supabase
        .from('affiliate_links')
        .update({
          conversion_count: supabase.raw('conversion_count + 1'),
          total_revenue: supabase.raw(
            `total_revenue + ${conversion.commission_amount}`
          ),
        })
        .eq('id', conversion.affiliate_link_id);

      return { data };
    } catch (error) {
      return {
        data: {} as AffiliateConversion,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to record affiliate conversion',
      };
    }
  }

  static async getAffiliateConversions(
    affiliateLinkId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: string;
      limit?: number;
    }
  ): Promise<ApiResponse<AffiliateConversion[]>> {
    try {
      let query = supabase
        .from('affiliate_conversions')
        .select(
          `
          *,
          click:click_id(session_id, clicked_at),
          user:user_id(id, email),
          affiliate_link:affiliate_link_id(name)
        `
        )
        .eq('affiliate_link_id', affiliateLinkId)
        .order('converted_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('converted_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('converted_at', filters.endDate.toISOString());
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
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
            : 'Failed to fetch affiliate conversions',
      };
    }
  }

  // Analytics and Reporting

  static async getAffiliateAnalytics(
    affiliateLinkId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    ApiResponse<{
      totalClicks: number;
      totalConversions: number;
      totalRevenue: number;
      conversionRate: number;
      averageCommission: number;
      clicksByDate: Array<{ date: string; clicks: number }>;
      conversionsByDate: Array<{
        date: string;
        conversions: number;
        revenue: number;
      }>;
    }>
  > {
    try {
      const start = startDate?.toISOString().split('T')[0] || '2024-01-01';
      const end =
        endDate?.toISOString().split('T')[0] ||
        new Date().toISOString().split('T')[0];

      // Get summary stats
      const { data: summaryData, error: summaryError } = await supabase
        .from('affiliate_links')
        .select('click_count, conversion_count, total_revenue')
        .eq('id', affiliateLinkId)
        .single();

      if (summaryError) throw summaryError;

      // Get clicks by date
      const { data: clicksData, error: clicksError } = await supabase
        .from('affiliate_clicks')
        .select('clicked_at')
        .eq('affiliate_link_id', affiliateLinkId)
        .gte('clicked_at', `${start}T00:00:00Z`)
        .lte('clicked_at', `${end}T23:59:59Z`);

      if (clicksError) throw clicksError;

      // Get conversions by date
      const { data: conversionsData, error: conversionsError } = await supabase
        .from('affiliate_conversions')
        .select('converted_at, commission_amount')
        .eq('affiliate_link_id', affiliateLinkId)
        .gte('converted_at', `${start}T00:00:00Z`)
        .lte('converted_at', `${end}T23:59:59Z`);

      if (conversionsError) throw conversionsError;

      // Process clicks by date
      const clicksByDate = this.groupByDate(
        clicksData || [],
        'clicked_at',
        'clicks'
      );

      // Process conversions by date
      const conversionsByDate = this.groupByDate(
        conversionsData || [],
        'converted_at',
        'conversions',
        'commission_amount'
      );

      const totalClicks = summaryData?.click_count || 0;
      const totalConversions = summaryData?.conversion_count || 0;
      const totalRevenue = summaryData?.total_revenue || 0;
      const conversionRate =
        totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const averageCommission =
        totalConversions > 0 ? totalRevenue / totalConversions : 0;

      return {
        data: {
          totalClicks,
          totalConversions,
          totalRevenue,
          conversionRate,
          averageCommission,
          clicksByDate,
          conversionsByDate,
        },
      };
    } catch (error) {
      return {
        data: {
          totalClicks: 0,
          totalConversions: 0,
          totalRevenue: 0,
          conversionRate: 0,
          averageCommission: 0,
          clicksByDate: [],
          conversionsByDate: [],
        },
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch affiliate analytics',
      };
    }
  }

  static async getTopPerformingAffiliateLinks(
    limit = 10,
    startDate?: Date,
    endDate?: Date
  ): Promise<ApiResponse<AffiliateLink[]>> {
    try {
      let query = supabase
        .from('affiliate_links')
        .select('*')
        .eq('status', 'active')
        .order('total_revenue', { ascending: false })
        .limit(limit);

      if (startDate) {
        // Filter by creation date for new links
        query = query.gte('created_at', startDate.toISOString());
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
            : 'Failed to fetch top performing affiliate links',
      };
    }
  }

  // Utility Methods

  private static groupByDate(
    data: any[],
    dateField: string,
    countField: string,
    sumField?: string
  ): Array<{ date: string; [key: string]: any }> {
    const grouped: { [key: string]: any } = {};

    data.forEach((item) => {
      const date = new Date(item[dateField]).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = { date, [countField]: 0 };
        if (sumField) {
          grouped[date][sumField] = 0;
        }
      }
      grouped[date][countField]++;
      if (sumField && item[sumField]) {
        grouped[date][sumField] += parseFloat(item[sumField]);
      }
    });

    return Object.values(grouped).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );
  }

  // Compliance and Validation

  static async validateAffiliateLink(link: AffiliateLink): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    // Check required fields
    if (!link.name?.trim()) {
      errors.push('Affiliate link name is required');
    }

    if (!link.url?.trim()) {
      errors.push('Affiliate URL is required');
    } else {
      // Validate URL format
      try {
        new URL(link.url);
      } catch {
        errors.push('Invalid affiliate URL format');
      }
    }

    if (!link.partner_name?.trim()) {
      errors.push('Partner name is required');
    }

    if (!link.disclosure_text?.trim()) {
      errors.push('Disclosure text is required for compliance');
    }

    // Check commission rate
    if (link.commission_rate < 0 || link.commission_rate > 100) {
      errors.push('Commission rate must be between 0 and 100');
    }

    // Check expiration date
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      errors.push('Expiration date cannot be in the past');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Bulk Operations

  static async bulkUpdateAffiliateLinks(
    updates: Array<{ id: string; updates: Partial<AffiliateLink> }>
  ): Promise<
    ApiResponse<{ success: number; failed: number; errors: string[] }>
  > {
    try {
      const results = { success: 0, failed: 0, errors: [] as string[] };

      for (const update of updates) {
        try {
          await this.updateAffiliateLink(update.id, update.updates);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(
            `Failed to update ${update.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return { data: results };
    } catch (error) {
      return {
        data: {
          success: 0,
          failed: updates.length,
          errors: [
            error instanceof Error ? error.message : 'Bulk update failed',
          ],
        },
        error:
          error instanceof Error
            ? error.message
            : 'Failed to perform bulk update',
      };
    }
  }
}
