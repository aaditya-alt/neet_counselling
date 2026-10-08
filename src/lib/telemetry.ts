import { supabase } from './supabase';

export type TelemetryEvent = 'predictor_run' | 'college_compared' | 'college_viewed' | 'premium_page_viewed';

export async function logTelemetry(event: TelemetryEvent, metadata: Record<string, unknown> = {}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Store in localStorage for guest analytics
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('neet_telemetry') || '[]');
      history.push({ event, metadata, timestamp: new Date().toISOString() });
      localStorage.setItem('neet_telemetry', JSON.stringify(history.slice(-30)));
    }

    if (user) {
      await supabase.from('user_activities').insert({
        user_id: user.id,
        event_type: event,
        metadata,
      });
    }
  } catch (err) {
    console.debug('Telemetry error (non-fatal):', err);
  }
}
