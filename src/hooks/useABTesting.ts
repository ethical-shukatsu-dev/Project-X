'use client';

import { useState, useEffect } from 'react';
import { LOCALSTORAGE_KEYS } from '@/lib/constants/localStorage';

/**
 * A hook that implements A/B testing for anonymous mode.
 * Users are randomly assigned to anonymous or non-anonymous mode with 50/50 probability.
 * The assignment is stored in localStorage to ensure consistency across sessions.
 */
export default function useABTesting() {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if user already has an A/B test assignment
    const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.AB_TEST_ANONYMOUS);

    if (storedValue === null) {
      // Using current timestamp milliseconds for true randomness
      const timestamp = new Date().getTime();
      const isEven = timestamp % 2 === 0;

      console.log('AB Testing assignment - Timestamp:', timestamp, 'Is Even (Anonymous):', isEven);

      // Store as string 'true' or 'false' to ensure correct string comparison in analytics
      const assignmentValue = String(isEven);
      localStorage.setItem(LOCALSTORAGE_KEYS.AB_TEST_ANONYMOUS, assignmentValue);
      localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, assignmentValue);

      setIsAnonymous(isEven);
    } else {
      // Use existing assignment
      const assignedValue = storedValue === 'true';
      setIsAnonymous(assignedValue);

      // Ensure the anonymous mode setting matches the A/B test assignment
      localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, storedValue);

      console.log('AB Testing using existing assignment:', { storedValue, assignedValue });
    }

    setIsLoaded(true);
  }, []);

  return { isAnonymous, isLoaded };
}
