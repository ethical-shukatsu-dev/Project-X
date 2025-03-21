import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

interface DailyEventCount {
  event_date: string;
  event_type: string;
  count: number;
}

// Define a type for the transformed data
interface DailyEventData {
  date: string;
  [key: string]: string | number;
}

/**
 * GET handler for fetching analytics trend data
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    // Get daily event counts
    const { data, error } = await supabaseAdmin
      .rpc('get_daily_event_counts', { days });
    
    if (error) {
      console.error('Error fetching daily event counts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics trends' },
        { status: 500 }
      );
    }
    
    // Cast the data to the proper type
    const dailyCounts = (data || []) as DailyEventCount[];
    
    // Transform data for frontend charting
    // Process into a format: { date: '2023-01-01', signup_click: 5, dialog_close: 3, ... }
    const eventTypes = [...new Set(dailyCounts.map(item => item.event_type))];
    
    const transformedData = dailyCounts.reduce((acc, { event_date, event_type, count }) => {
      // Check if we already have an entry for this date
      const existingEntry = acc.find(item => item.date === event_date);
      
      if (existingEntry) {
        // Add the count to the existing entry
        existingEntry[event_type] = count;
      } else {
        // Create a new entry
        const newEntry: DailyEventData = { date: event_date };
        newEntry[event_type] = count;
        acc.push(newEntry);
      }
      
      return acc;
    }, [] as DailyEventData[]);
    
    // Ensure all event types have a value (0 if no data)
    transformedData.forEach(entry => {
      eventTypes.forEach(type => {
        if (entry[type] === undefined) {
          entry[type] = 0;
        }
      });
    });
    
    // Sort by date
    transformedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json({
      trends: transformedData,
      eventTypes
    });
  } catch (error) {
    console.error('Error in analytics trends API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 