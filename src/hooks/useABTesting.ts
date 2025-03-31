"use client";

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
    // Check if user already has an A/B test assignment
    const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.AB_TEST_ANONYMOUS);
    
    if (storedValue === null) {
      // No existing assignment, randomly assign with 50/50 probability
      const randomAssignment = Math.random() < 0.5;
      localStorage.setItem(LOCALSTORAGE_KEYS.AB_TEST_ANONYMOUS, String(randomAssignment));
      localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, String(randomAssignment));
      setIsAnonymous(randomAssignment);
    } else {
      // Use existing assignment
      const assignedValue = storedValue === 'true';
      setIsAnonymous(assignedValue);
      
      // Ensure the anonymous mode setting matches the A/B test assignment
      localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, storedValue);
    }
    
    setIsLoaded(true);
  }, []);
  
  return { isAnonymous, isLoaded };
} 