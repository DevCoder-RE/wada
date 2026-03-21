// Shared TypeScript type definitions for WADA BMAD project

// User types
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

// Supplement types
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

// Logbook types
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

// API response types
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

// Educational content types
export interface EducationalContent {
  id: string;
  title: string;
  content: string;
  type: 'article' | 'video' | 'infographic' | 'course' | 'webinar';
  categoryId: string;
  author: string;
  summary?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: number;
  status: 'draft' | 'review' | 'published' | 'archived';
  publishedAt?: Date;
  engagementMetrics: ContentEngagement;
  created_at: Date;
  updated_at: Date;
}

export interface ContentCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ContentEngagement {
  views: number;
  likes: number;
  bookmarks: number;
  shares: number;
  averageRating?: number;
  totalRatings?: number;
}

export interface UserContentEngagement {
  id: string;
  userId: string;
  contentId: string;
  viewedAt?: Date;
  likedAt?: Date;
  bookmarkedAt?: Date;
  sharedAt?: Date;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

// Affiliate types
export interface AffiliateLink {
  id: string;
  contentId?: string;
  supplementId?: string;
  retailerName: string;
  productUrl: string;
  commissionRate: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  affiliateCode?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AffiliateClick {
  id: string;
  userId?: string;
  affiliateLinkId: string;
  clickTimestamp: Date;
  source: string;
  deviceType?: string;
  country?: string;
  created_at: Date;
}

export interface AffiliateConversion {
  id: string;
  userId: string;
  affiliateLinkId: string;
  orderValue: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  conversionTimestamp: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ContentAnalytics {
  id: string;
  contentId: string;
  date: Date;
  views: number;
  uniqueViews: number;
  avgTimeSpent: number;
  bounceRate: number;
  conversionRate: number;
  affiliateClicks: number;
  affiliateConversions: number;
  revenue: number;
}

// Scan history types
export interface ScanHistoryEntry {
  id: string;
  barcode: string;
  supplementName?: string;
  brand?: string;
  verified: boolean;
  scannedAt: Date;
}
