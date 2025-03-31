import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

// Define the daily event count type
interface DailyEventCount {
  event_date: string;
  event_type: string;
  count: number;
}

/**
 * GET handler for fetching analytics trend data
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    const eventType = searchParams.get('eventType') || undefined;
    
    // Get daily event counts
    const { data: dailyCounts, error: countError } = await supabaseAdmin
      .rpc('get_daily_event_counts', { 
        days
      });
    
    if (countError) {
      console.error('Error fetching daily event counts:', countError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics trend data' },
        { status: 500 }
      );
    }
    
    // Cast the data to the proper type
    const typedDailyCounts = (dailyCounts || []) as DailyEventCount[];
    
    // Filter by event type if specified
    const filteredCounts = eventType 
      ? typedDailyCounts.filter(item => item.event_type === eventType)
      : typedDailyCounts;
    
    // Format the data for time-series charts
    // Group by date first to get all dates in the range
    const dateMap = new Map<string, Record<string, number>>();
    
    // Get unique event types
    const eventTypes = new Set<string>();
    
    // Process the data
    filteredCounts.forEach(item => {
      const { event_date, event_type, count } = item;
      
      if (!dateMap.has(event_date)) {
        dateMap.set(event_date, {});
      }
      
      const dateData = dateMap.get(event_date)!;
      dateData[event_type] = count;
      
      eventTypes.add(event_type);
    });
    
    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    // Create the series data
    const seriesData = Array.from(eventTypes).map(type => {
      return {
        name: type,
        data: sortedDates.map(date => {
          const dateData = dateMap.get(date) || {};
          return dateData[type] || 0;
        })
      };
    });
    
    // Calculate conversion trends
    // Get home page visits by date
    const homePageVisitsByDate = new Map<string, number>();
    filteredCounts
      .filter(item => item.event_type === 'home_page_visit')
      .forEach(item => {
        homePageVisitsByDate.set(item.event_date, item.count);
      });
    
    // Get survey start clicks by date
    const surveyStartsByDate = new Map<string, number>();
    filteredCounts
      .filter(item => item.event_type === 'survey_start_click')
      .forEach(item => {
        surveyStartsByDate.set(item.event_date, item.count);
      });
    
    // Get survey completions by date
    const surveyCompletionsByDate = new Map<string, number>();
    filteredCounts
      .filter(item => item.event_type === 'survey_completed')
      .forEach(item => {
        surveyCompletionsByDate.set(item.event_date, item.count);
      });
    
    // Calculate conversion rates by date
    const conversionTrends = sortedDates.map(date => {
      const visits = homePageVisitsByDate.get(date) || 0;
      const starts = surveyStartsByDate.get(date) || 0;
      const completions = surveyCompletionsByDate.get(date) || 0;
      
      const startRate = visits > 0 ? Math.round((starts / visits) * 100) : 0;
      const completionRate = starts > 0 ? Math.round((completions / starts) * 100) : 0;
      const overallRate = visits > 0 ? Math.round((completions / visits) * 100) : 0;
      
      return {
        date,
        startRate,
        completionRate,
        overallRate
      };
    });
    
    return NextResponse.json({
      dates: sortedDates,
      seriesData,
      conversionTrends,
      rawData: filteredCounts
    });
  } catch (error) {
    console.error('Error in analytics trends API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 