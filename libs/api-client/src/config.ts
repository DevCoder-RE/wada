// Supabase configuration
// CRA only inlines REACT_APP_* variables at build time, so the browser app
// must read those names. The unprefixed fallbacks keep Node consumers working.
export const supabaseConfig = {
  url:
    process.env.REACT_APP_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://your-project.supabase.co',
  anonKey:
    process.env.REACT_APP_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'your-anon-key',
  serviceRoleKey:
    process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Realtime configuration
export const realtimeConfig = {
  eventsPerSecond: 10,
  maxRetries: 3,
  retryDelay: 1000,
};

// API configuration
export const apiConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000,
};

// Development vs Production settings
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// CORS configuration for different environments
export const corsOrigins = {
  development: ['http://localhost:3000', 'http://localhost:3001'],
  production: [
    process.env.REACT_APP_FRONTEND_URL ||
      process.env.FRONTEND_URL ||
      'https://your-app.com',
  ],
};