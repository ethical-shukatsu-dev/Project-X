'use client';

import { useEffect } from 'react';
import { trackRecommendationsViewed } from '@/lib/analytics';
import { useClarity } from '@/hooks/useClarity';

interface RecommendationsTrackerProps {
  companyCount?: number;
}

export default function RecommendationsTracker({ companyCount }: RecommendationsTrackerProps) {
  const { setTag } = useClarity();

  useEffect(() => {
    // Track the recommendations page view
    trackRecommendationsViewed().catch((error) => {
      console.error('Error tracking recommendations view:', error);
    });

    // Set tags in Clarity for better analysis
    setTag('page_type', 'recommendations');

    // If we know how many companies are being shown, track that info
    if (companyCount !== undefined) {
      setTag('company_count', companyCount.toString());
    }

    // Track the timestamp
    setTag('recommendations_view_time', new Date().toISOString());
  }, [setTag, companyCount]);

  // This component doesn't render anything visible
  return null;
}
