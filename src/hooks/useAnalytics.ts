import { useState, useEffect } from 'react';
import { 
  AnalyticsData, 
  TimeRange,
  DateRange
} from '@/types/analytics';

export function useAnalytics(initialTimeRange: TimeRange = 'all') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (selectedTimeRange: TimeRange = timeRange, metricKey?: string, customDateRange?: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `/api/admin/analytics?timeRange=${selectedTimeRange}${metricKey ? `&metric=${metricKey}` : ''}`;
      
      // If it's a custom date range, append the date parameters
      if (selectedTimeRange === 'custom' && (customDateRange || dateRange)) {
        const dates = customDateRange || dateRange;
        if (dates) {
          url += `&startDate=${dates.startDate}&endDate=${dates.endDate}`;
        }
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status} ${response.statusText}`);
      }
      
      const analyticsData = await response.json();
      
      // If fetching a specific metric, merge with existing data
      if (metricKey && data) {
        // For specific metrics, the API returns partial data
        // so we need to merge it with existing data
        setData({
          ...data,
          stats: {
            ...data.stats,
            ...analyticsData.stats,
            // Handle nested objects that might be partial
            surveyFunnel: analyticsData.stats.surveyFunnel 
              ? { ...data.stats.surveyFunnel, ...analyticsData.stats.surveyFunnel }
              : data.stats.surveyFunnel,
            surveyTypes: analyticsData.stats.surveyTypes
              ? { ...data.stats.surveyTypes, ...analyticsData.stats.surveyTypes }
              : data.stats.surveyTypes,
            recommendations: analyticsData.stats.recommendations
              ? { ...data.stats.recommendations, ...analyticsData.stats.recommendations }
              : data.stats.recommendations,
            signups: analyticsData.stats.signups
              ? { ...data.stats.signups, ...analyticsData.stats.signups }
              : data.stats.signups,
            anonymousUsers: analyticsData.stats.anonymousUsers
              ? { ...data.stats.anonymousUsers, ...analyticsData.stats.anonymousUsers }
              : data.stats.anonymousUsers,
            abTestComparison: analyticsData.stats.abTestComparison
              ? {
                  ...data.stats.abTestComparison,
                  ...analyticsData.stats.abTestComparison,
                  anonymous: analyticsData.stats.abTestComparison.anonymous
                    ? { ...data.stats.abTestComparison.anonymous, ...analyticsData.stats.abTestComparison.anonymous }
                    : data.stats.abTestComparison.anonymous,
                  nonAnonymous: analyticsData.stats.abTestComparison.nonAnonymous
                    ? { ...data.stats.abTestComparison.nonAnonymous, ...analyticsData.stats.abTestComparison.nonAnonymous }
                    : data.stats.abTestComparison.nonAnonymous,
                  difference: analyticsData.stats.abTestComparison.difference
                    ? { ...data.stats.abTestComparison.difference, ...analyticsData.stats.abTestComparison.difference }
                    : data.stats.abTestComparison.difference,
                }
              : data.stats.abTestComparison,
            // Arrays can be replaced if present
            surveySteps: analyticsData.stats.surveySteps || data.stats.surveySteps,
            dropoffAnalysis: analyticsData.stats.dropoffAnalysis || data.stats.dropoffAnalysis,
          }
        });
      } else {
        // If fetching all data, replace the entire state
        setData(analyticsData);
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Change time range and refetch data
  const changeTimeRange = (newTimeRange: TimeRange, customDateRange?: DateRange) => {
    setTimeRange(newTimeRange);
    
    if (newTimeRange === 'custom' && customDateRange) {
      setDateRange(customDateRange);
      fetchAnalytics(newTimeRange, undefined, customDateRange);
    } else {
      setDateRange(null);
      fetchAnalytics(newTimeRange);
    }
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
    dateRange,
    changeTimeRange,
    refreshData: fetchAnalytics,
  };
} 