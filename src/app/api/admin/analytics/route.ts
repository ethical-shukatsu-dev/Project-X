import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

// Define allowed time ranges
type TimeRange = '24h' | '7d' | '30d' | 'all';

// Define the event count type
interface EventCount {
  event_type: string;
  count: number;
}

/**
 * GET handler for fetching analytics data
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get('timeRange') || '7d') as TimeRange;
    const eventType = searchParams.get('eventType') || undefined;
    
    // Calculate the start date based on the time range
    let startDate: Date | null = null;
    const now = new Date();
    
    if (timeRange === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    } else if (timeRange === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    } else if (timeRange === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    }
    
    // Build the query
    let query = supabaseAdmin
      .from('analytics_events')
      .select('*');
    
    // Apply filters
    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }
    
    // Execute the query
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching analytics data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }
    
    // Get event counts by type using raw SQL
    const { data: eventCounts, error: countError } = await supabaseAdmin
      .rpc('get_event_counts', { 
        start_date: startDate ? startDate.toISOString() : '1970-01-01' 
      });
    
    if (countError) {
      console.error('Error fetching event counts:', countError);
    }
    
    // Cast the event counts to the proper type
    const typedEventCounts = (eventCounts || []) as EventCount[];
    
    // Get signup conversion rate (signup clicks vs. dialog closes)
    const signupClicks = typedEventCounts.find(item => item.event_type === 'signup_click')?.count || 0;
    const dialogCloses = typedEventCounts.find(item => item.event_type === 'dialog_close')?.count || 0;
    
    const conversionRate = dialogCloses > 0 
      ? Math.round((signupClicks / (signupClicks + dialogCloses)) * 100) 
      : 0;
    
    return NextResponse.json({
      events: data,
      eventCounts: typedEventCounts,
      stats: {
        totalEvents: data.length,
        signupClicks,
        dialogCloses,
        conversionRate: `${conversionRate}%`,
      }
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 