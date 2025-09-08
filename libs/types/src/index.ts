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