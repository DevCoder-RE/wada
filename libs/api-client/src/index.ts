// Shared API client for Supabase integration

export { supabase } from './client';
export { AuthService } from './auth.service';
export { DatabaseService } from './database.service';
export { RealtimeService } from './realtime.service';
export { ErrorHandler } from './error-handler';

// Export CertificationService
export { CertificationService } from './certification-service';

// Export Content Management and Affiliate Tracking services
export { ContentManagementService } from './content-management.service';
export { AffiliateTrackingService } from './affiliate-tracking.service';

// Export Secure Logbook service and its types
export { SecureLogbookService } from './secure-logbook.service';
export type {
  SecureLogbookEntry,
  AuditEntry,
  ComplianceSummary,
  ComplianceAlert,
} from './secure-logbook.service';