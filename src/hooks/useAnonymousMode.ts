import { useState, useEffect } from 'react';
import { LOCALSTORAGE_KEYS } from '@/lib/constants/localStorage';

export default function useAnonymousMode() {
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Load state from localStorage on mount, default to true if not set
    const storedValue = localStorage.getItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES);
    if (storedValue === null) {
      // Set default value in localStorage if not already set
      localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, 'true');
      setIsAnonymous(true);
    } else {
      setIsAnonymous(storedValue === 'true');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever state changes
  const toggleAnonymousMode = () => {
    const newValue = !isAnonymous;
    setIsAnonymous(newValue);
    localStorage.setItem(LOCALSTORAGE_KEYS.ANONYMOUS_COMPANIES, String(newValue));
  };

  return { isAnonymous, toggleAnonymousMode, isLoaded };
} 