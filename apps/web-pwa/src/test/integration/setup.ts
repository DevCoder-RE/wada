// apps/web-pwa/src/test/integration/setup.ts
import { createClient } from '@supabase/supabase-js';

export const createTestClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
};
