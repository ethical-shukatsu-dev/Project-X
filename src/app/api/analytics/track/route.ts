import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

/**
 * API endpoint to receive analytics events
 *
 * This endpoint receives analytics events and stores them
 * in the Supabase database for later analysis.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse event data from the request
    const eventData = await request.json();
    console.log('DIAGNOSTICS - Received event:', eventData);

    if (!eventData || !eventData.event_type) {
      return NextResponse.json(
        { error: 'Invalid event data. Missing required fields.' },
        { status: 400 }
      );
    }

    // Log the event for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Analytics event received:', eventData);
    }

    // Prepare data for insertion
    const { event_type, timestamp, session_id, user_id, properties } = eventData;

    // Insert the event into the analytics_events table
    const { error } = await supabaseAdmin.from('analytics_events').insert({
      event_type,
      timestamp: new Date(timestamp).toISOString(),
      session_id,
      user_id,
      properties,
    });

    if (error) {
      console.error('Error inserting analytics event into database:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics event in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics event:', error);

    return NextResponse.json({ error: 'Failed to process analytics event' }, { status: 500 });
  }
}
