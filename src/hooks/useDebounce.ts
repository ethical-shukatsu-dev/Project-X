'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * A hook that delays updating a value until a specified timeout
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @param immediate Whether to immediately return the first value
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number, immediate = false): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const previousValueRef = useRef<T | undefined>(undefined);
  const initialValueRef = useRef<boolean>(true);

  useEffect(() => {
    // If this is the first render and immediate is true, use the initial value
    if (initialValueRef.current && immediate) {
      initialValueRef.current = false;
      setDebouncedValue(value);
      previousValueRef.current = value;
      return;
    }

    // Store the current value as previous
    previousValueRef.current = value;

    // Set timeout to update the debounced value after delay
    const timer = setTimeout(() => {
      // Only update if value hasn't changed since timeout started
      if (previousValueRef.current === value) {
        setDebouncedValue(value);
      }
    }, delay);

    // Clean up on unmount or when value changes
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, immediate]);

  return debouncedValue;
}

export default useDebounce;
