import { supabase } from './supabase';

export type TelemetryEvent = 
  | 'predictor_run' 
  | 'college_compared' 
  | 'college_viewed' 
  | 'premium_page_viewed'
  | 'dialer_opened'
  | 'callback_requested';

export interface TelemetryRecord {
  id: string;
  eventType: TelemetryEvent;
  metadata: Record<string, any>;
  timestamp: string;
  guestSessionId: string;
}

function getGuestSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  let id = localStorage.getItem('cm_guest_session_id');
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem('cm_guest_session_id', id);
  }
  return id;
}

export async function logTelemetry(event: TelemetryEvent, metadata: Record<string, any> = {}) {
  const guestSessionId = getGuestSessionId();
  const timestamp = new Date().toISOString();

  const record: TelemetryRecord = {
    id: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    eventType: event,
    metadata,
    timestamp,
    guestSessionId,
  };

  // Local storage cache
  if (typeof window !== 'undefined') {
    try {
      const history: TelemetryRecord[] = JSON.parse(localStorage.getItem('cm_telemetry_history') || '[]');
      history.push(record);
      localStorage.setItem('cm_telemetry_history', JSON.stringify(history.slice(-100)));
    } catch {}
  }

  // Real Supabase insert into user_activities
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('user_activities').insert({
      user_id: user?.id || null,
      event_type: event,
      metadata: {
        ...metadata,
        guest_session_id: guestSessionId,
        timestamp,
      },
    });
  } catch (err) {
    console.debug('Telemetry sync fallback (stored locally):', err);
  }
}

export function getTelemetryHistory(): TelemetryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('cm_telemetry_history') || '[]');
  } catch {
    return [];
  }
}
