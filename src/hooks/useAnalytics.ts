import { useState, useEffect } from 'react';

// Define a type for an analytics event
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  timestamp: string;
  session_id?: string;
  user_id?: string;
  properties?: Record<string, unknown>;
  created_at: string;
}

// Type definitions for the analytics data
export interface AnalyticsData {
  events: AnalyticsEvent[];
  eventCounts: {
    event_type: string;
    count: number;
  }[];
  stats: {
    totalEvents: number;
    signupClicks: number;
    dialogCloses: number;
    conversionRate: string;
    surveyFunnel: {
      visits: number;
      started: number;
      completed: number;
      startRate: string;
      completionRate: string;
      overallConversionRate: string;
    };
    surveyTypes: {
      text: number;
      image: number;
      total: number;
    };
    recommendations: {
      pageVisits: number;
      companyInterestClicks: number;
      companyInterestRate: string;
      averageCompaniesPerUser: number;
    };
    signups: {
      emailSignups: number;
      googleSignups: number;
      totalSignups: number;
    };
  };
}

// Type for the time range filter
export type TimeRange = '24h' | '7d' | '30d' | 'all';

export function useAnalytics(initialTimeRange: TimeRange = '7d') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);

  // Fetch analytics data
  const fetchAnalytics = async (selectedTimeRange: TimeRange = timeRange) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${selectedTimeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Change time range and refetch data
  const changeTimeRange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    fetchAnalytics(newTimeRange);
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    loading,
    error,
    timeRange,
    changeTimeRange,
    refreshData: fetchAnalytics,
  };
} 