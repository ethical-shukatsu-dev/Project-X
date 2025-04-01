/**
 * Analytics utility functions for tracking user actions
 */
import { LOCALSTORAGE_KEYS } from '@/lib/constants/localStorage';

type EventType = 
  // Existing events
  'signup_click' | 
  'dialog_close' | 
  'feedback' | 
  'page_view' |
  // Home page events
  'home_page_visit' |
  'survey_start_click' |
  // Survey type events
  'survey_type_selected' |
  // Survey progress events
  'survey_step_completed' |
  'survey_step_abandoned' |  // New event type for abandonment
  'survey_completed' |
  // Recommendations events
  'recommendations_page_visit' |
  'company_interested_click' |
  // Signup events
  'email_signup_click' |
  'google_signup_click';

interface AnalyticsEvent {
  event_type: EventType;
  timestamp: number;
  user_id?: string;
  session_id?: string;
  properties?: Record<string, unknown>;
}

// Get or create a user ID with a 30-day expiration
const getUserId = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Check for existing user ID in cookie
  const userIdCookie = document.cookie.split(';')
    .find(item => item.trim().startsWith('analytics_user_id='));
  
  if (userIdCookie) {
    return userIdCookie.split('=')[1];
  }
  
  // Create new user ID if none exists
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Set cookie to expire in 30 days
  const expires = new Date();
  expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  // Set secure cookie with SameSite policy
  document.cookie = `analytics_user_id=${userId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  
  return userId;
};

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

// Get the anonymous status from localStorage
const getAnonymousStatus = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.AB_TEST_ANONYMOUS);
  return storedValue === 'true';
};

/**
 * Track an event to the analytics backend
 */
export const trackEvent = async (
  eventType: EventType,
  properties?: Record<string, unknown>
): Promise<void> => {
  try {
    // Get session ID and user ID
    const sessionId = getSessionId();
    const userId = getUserId();
    
    // Get anonymous status
    const isAnonymous = getAnonymousStatus();
    
    // Create event payload
    const event: AnalyticsEvent = {
      event_type: eventType,
      timestamp: Date.now(),
      session_id: sessionId,
      user_id: userId,
      properties: {
        ...properties,
        isAnonymous
      },
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

/**
 * Track home page visit
 */
export const trackHomePageVisit = async (): Promise<void> => {
  // Check if we're in the browser
  if (typeof window === 'undefined') return;

  // Get the user ID (will create one if it doesn't exist)
  const userId = getUserId();
  
  // Check for visit cookie
  const hasVisitedCookie = document.cookie.split(';').some(item => item.trim().startsWith('home_page_visited_'));
  
  // Only track if this is their first visit
  if (!hasVisitedCookie) {
    await trackEvent('home_page_visit');
    
    // Set cookie to expire in 24 hours for daily unique tracking
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Set secure cookie with SameSite policy
    document.cookie = `home_page_visited_${userId}=true; expires=${expires.toUTCString()}; path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  }
};

/**
 * Track survey start click
 */
export const trackSurveyStartClick = async (): Promise<void> => {
  await trackEvent('survey_start_click');
};

/**
 * Track survey type selection
 */
export const trackSurveyTypeSelection = async (surveyType: 'text' | 'image'): Promise<void> => {
  await trackEvent('survey_type_selected', { surveyType });
};

/**
 * Track survey step completion
 */
export const trackSurveyStepCompleted = async (
  stepIndex: number, 
  stepId: string,
  totalSteps: number
): Promise<void> => {
  await trackEvent('survey_step_completed', { 
    stepIndex,
    stepId, 
    totalSteps,
    progress: Math.round((stepIndex / totalSteps) * 100),
    completedAt: new Date().toISOString()
  });
};

/**
 * Track when a user abandons a survey step
 */
export const trackSurveyStepAbandoned = async (
  stepIndex: number,
  stepId: string,
  totalSteps: number,
  timeSpentSeconds: number,
  reason?: string
): Promise<void> => {
  await trackEvent('survey_step_abandoned', { 
    stepIndex,
    stepId, 
    totalSteps,
    timeSpentSeconds,
    abandonedAt: new Date().toISOString(),
    reason: reason || 'unknown'
  });
};

/**
 * Track survey completion
 */
export const trackSurveyCompleted = async (
  surveyType: 'text' | 'image',
  totalSteps: number,
  timeSpentSeconds: number
): Promise<void> => {
  await trackEvent('survey_completed', { 
    surveyType,
    totalSteps,
    timeSpentSeconds,
    completedAt: new Date().toISOString()
  });
};

/**
 * Track recommendations page visit
 */
export const trackRecommendationsPageVisit = async (): Promise<void> => {
  await trackEvent('recommendations_page_visit');
};

/**
 * Track company interested click
 */
export const trackCompanyInterestedClick = async (
  companyId: string,
  companyName: string
): Promise<void> => {
  await trackEvent('company_interested_click', { 
    companyId,
    companyName 
  });
};

/**
 * Track email signup click
 */
export const trackEmailSignupClick = async (): Promise<void> => {
  await trackEvent('email_signup_click');
};

/**
 * Track Google signup click
 */
export const trackGoogleSignupClick = async (): Promise<void> => {
  await trackEvent('google_signup_click');
}; 