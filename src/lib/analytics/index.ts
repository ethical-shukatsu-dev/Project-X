/**
 * Analytics utility functions for tracking user actions
 */

type EventType = 'signup_click' | 'dialog_close' | 'feedback' | 'page_view';

interface AnalyticsEvent {
  event_type: EventType;
  timestamp: number;
  user_id?: string;
  session_id?: string;
  properties?: Record<string, unknown>;
}

// Get or create a session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

/**
 * Track an event to the analytics backend
 */
export const trackEvent = async (
  eventType: EventType,
  properties?: Record<string, unknown>
): Promise<void> => {
  try {
    // Get session ID
    const sessionId = getSessionId();
    
    // Create event payload
    const event: AnalyticsEvent = {
      event_type: eventType,
      timestamp: Date.now(),
      session_id: sessionId,
      properties,
    };
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event tracked:', event);
    }
    
    // Send to the analytics API endpoint
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch (error) {
    // Don't let analytics errors affect the user experience
    console.error('Error tracking analytics event:', error);
  }
};

/**
 * Track a signup button click
 */
export const trackSignupClick = async (source: string, properties?: Record<string, unknown>): Promise<void> => {
  await trackEvent('signup_click', {
    source,
    ...properties,
  });
}; 