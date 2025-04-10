'use client';

import { useEffect } from 'react';
import { trackHomePageVisit } from '@/lib/analytics';

export default function HomePageTracker() {
  useEffect(() => {
    // Track the home page visit event when the component mounts
    trackHomePageVisit().catch((error) => {
      console.error('Error tracking home page visit:', error);
    });
  }, []);

  // This component doesn't render anything visible
  return null;
}
