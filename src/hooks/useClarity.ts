'use client';

import { useCallback } from 'react';
import clarity from '@microsoft/clarity';
import { CLARITY_ENABLED } from '@/lib/clarity';

export function useClarity() {
  /**
   * Set a custom tag in Clarity to help with filtering and analysis
   */
  const setTag = useCallback((key: string, value: string | string[]) => {
    if (CLARITY_ENABLED && typeof window !== 'undefined') {
      try {
        clarity.setTag(key, value);
      } catch (error) {
        console.error('Error setting Clarity tag:', error);
      }
    }
  }, []);

  /**
   * Identify a user for tracking across sessions
   */
  const identifyUser = useCallback((userId: string, userName?: string) => {
    if (CLARITY_ENABLED && typeof window !== 'undefined' && userId) {
      try {
        clarity.identify(userId, undefined, undefined, userName);
      } catch (error) {
        console.error('Error identifying user in Clarity:', error);
      }
    }
  }, []);

  /**
   * Set user's consent state for tracking
   */
  const setConsent = useCallback((hasConsent: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        clarity.consent(hasConsent);
      } catch (error) {
        console.error('Error setting Clarity consent:', error);
      }
    }
  }, []);

  return { setTag, identifyUser, setConsent };
}
