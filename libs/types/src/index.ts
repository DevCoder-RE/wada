// Shared TypeScript type definitions for WADA BMAD project

export interface AthleteProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  date_of_birth?: Date;
  sport: string;
  team?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'athlete' | 'coach' | 'admin';
  profile?: AthleteProfile;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  theme: string;
  language: string;
  timezone: string;
  created_at: Date;
  updated_at: Date;
}

export interface Supplement {
  id: string;
  name: string;
  brand: string;
  description?: string;
  ingredients: Ingredient[];
  certifications: Certification[];
  barcode?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Ingredient {
  id: string;
  supplement_id: string;
  name: string;
  amount: number;
  unit: string;
  created_at: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: 'NSF' | 'Informed_Sport' | 'ISO_17025' | 'WADA_Compliant';
  valid_until?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface LogbookEntry {
  id: string;
  athlete_id: string;
  supplement_id: string;
  amount: number;
  unit: string;
  timestamp: Date;
  notes?: string;
  verified: boolean;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TrackingData {
  athlete_id: string;
  period: {
    start: Date;
    end: Date;
  };
  entries: LogbookEntry[];
  summary: {
    total_entries: number;
    verified_entries: number;
    compliance_rate: number;
    unique_supplements: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: AuthUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export interface EducationalContent {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content_type: 'article' | 'video' | 'infographic' | 'course' | 'webinar';
  content?: string;
  media_url?: string;
  thumbnail_url?: string;
  author_id: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  published_at?: Date;
  tags?: string[];
  category: string;
  reading_time_minutes?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  is_featured: boolean;
  view_count: number;
  like_count: number;
  share_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at?: Date;
}

export interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  affiliate_code?: string;
  commission_rate?: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  partner_name: string;
  partner_website?: string;
  disclosure_text?: string;
  expires_at?: Date;
  click_count: number;
  conversion_count: number;
  total_revenue: number;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ContentEngagement {
  id?: string;
  user_id: string;
  content_id: string;
  engagement_type: 'view' | 'like' | 'bookmark' | 'share' | 'complete';
  progress_percentage?: number;
  time_spent_seconds?: number;
  completed_at?: Date;
  created_at?: Date;
}

export interface ContentAnalytics {
  id: string;
  content_id: string;
  date: Date;
  views: number;
  unique_views: number;
  avg_time_spent_seconds: number;
  bounce_rate: number;
  completion_rate: number;
  created_at: Date;
}

export interface AffiliateClick {
  id: string;
  affiliate_link_id: string;
  user_id?: string;
  content_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;
  clicked_at: Date;
  created_at?: Date;
}

export interface AffiliateConversion {
  id: string;
  affiliate_link_id: string;
  click_id?: string;
  user_id?: string;
  order_id?: string;
  commission_amount: number;
  currency?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  converted_at: Date;
  paid_at?: Date;
  created_at?: Date;
}

export interface ScanHistoryEntry {
  id: string;
  barcode: string;
  supplementName?: string;
  brand?: string;
  verified: boolean;
  scannedAt: Date;
}
