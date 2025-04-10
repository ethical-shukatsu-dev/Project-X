'use client';

import clarity from '@microsoft/clarity';
import { CLARITY_ENABLED } from './clarity';

/**
 * Track a page view in Clarity with additional metadata
 */
export function trackPageView(pageName: string, metadata: Record<string, string | string[]> = {}) {
  if (!CLARITY_ENABLED || typeof window === 'undefined') return;

  try {
    // Set the page name as a tag
    clarity.setTag('page', pageName);

    // Add any additional metadata as tags
    Object.entries(metadata).forEach(([key, value]) => {
      clarity.setTag(key, value);
    });

    console.log(`Tracked page view: ${pageName}`);
  } catch (error) {
    console.error('Error tracking page view in Clarity:', error);
  }
}

/**
 * Track a user in Clarity after authentication
 */
export function trackAuthenticatedUser(
  userId: string,
  userInfo?: { name?: string; email?: string; role?: string }
) {
  if (!CLARITY_ENABLED || typeof window === 'undefined' || !userId) return;

  try {
    // Identify the user
    clarity.identify(userId, undefined, undefined, userInfo?.name);

    // Add user metadata as tags
    if (userInfo?.email) {
      clarity.setTag('userEmail', userInfo.email);
    }

    if (userInfo?.role) {
      clarity.setTag('userRole', userInfo.role);
    }

    console.log(`User identified in Clarity: ${userId}`);
  } catch (error) {
    console.error('Error identifying user in Clarity:', error);
  }
}
