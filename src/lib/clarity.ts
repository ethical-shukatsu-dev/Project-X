/**
 * Microsoft Clarity configuration
 *
 * Replace this placeholder with your actual Clarity Project ID
 * from your Microsoft Clarity dashboard.
 */
export const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || 'your-clarity-project-id';

// Enable or disable Clarity based on environment
export const CLARITY_ENABLED =
  process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_CLARITY === 'true';
