// Real-time subscriptions

import { supabase } from './client';

export class RealtimeService {
  static subscribeToLogbookUpdates(
    athleteId: string,
    callback: (payload: any) => void
  ): () => void {
    const channel = supabase
      .channel('logbook_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'logbook_entries',
          filter: `athleteId=eq.${athleteId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}