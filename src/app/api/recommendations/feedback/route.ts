import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the request body
    if (!body.recommendationId || !body.feedback) {
      return NextResponse.json(
        { error: 'Recommendation ID and feedback are required' },
        { status: 400 }
      );
    }

    // Validate feedback value
    if (body.feedback !== 'interested' && body.feedback !== 'not_interested') {
      return NextResponse.json(
        { error: 'Feedback must be either "interested" or "not_interested"' },
        { status: 400 }
      );
    }

    // Update the recommendation in Supabase
    const { error } = await supabase
      .from('recommendations')
      .update({ feedback: body.feedback })
      .eq('id', body.recommendationId);

    if (error) {
      console.error('Error updating recommendation feedback:', error);
      return NextResponse.json(
        { error: 'Failed to update recommendation feedback' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
