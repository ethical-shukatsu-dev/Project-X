import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

// Define allowed time ranges
type TimeRange = '24h' | '7d' | '30d' | 'all';

// Types for analytics data
interface EventCount {
  event_type: string;
  count: number;
}

interface SurveyStep {
  step_id: string;
  unique_users: number;
  stepIndex?: number;
}

interface SurveyDropoff {
  step_id: string;
  unique_users: number;
  avg_time_spent?: number;
  stepIndex?: number;
}

interface StepMetric {
  stepIndex?: number;
}

// Define survey funnel metrics
interface SurveyFunnelMetrics {
  visits: number;
  uniqueUsers: number;
  started: number;
  completed: number;
  startRate: string;
  completionRate: string;
  overallConversionRate: string;
}

// Format step labels
const formatStepLabel = (stepId: string): string => {
  // Check if step ID contains underscores (e.g., "work_values")
  if (stepId.includes('_')) {
    return stepId.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  // For numeric steps like "step_1", extract the number
  const stepMatch = stepId.match(/step[_-]?(\d+)/i);
  if (stepMatch && stepMatch[1]) {
    return `Step ${stepMatch[1]}`;
  }
  
  // Default formatting for other formats
  return stepId.charAt(0).toUpperCase() + stepId.slice(1);
};

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

    // Get unique visitor counts for all relevant events
    const { data: uniqueCounts, error: uniqueError } = await supabaseAdmin
      .rpc('get_multiple_event_counts', { 
        start_date: startDate ? startDate.toISOString() : new Date('1970-01-01T00:00:00.000Z').toISOString()
      });

    if (uniqueError) {
      console.error('Error fetching unique counts:', uniqueError);
    }
    
    // Cast the event counts to the proper type
    const typedEventCounts = (eventCounts || []) as EventCount[];
    
    // Home page and survey funnel metrics
    const uniqueVisits = uniqueCounts?.home_page_visits?.unique_users || 0;
    const uniqueStarts = uniqueCounts?.survey_starts?.unique_users || 0;
    const uniqueCompletions = uniqueCounts?.survey_completions?.unique_users || 0;
    
    const surveyStartRate = uniqueVisits > 0 
      ? Math.round((uniqueStarts / uniqueVisits) * 100) 
      : 0;
      
    const surveyCompletionRate = uniqueStarts > 0 
      ? Math.round((uniqueCompletions / uniqueStarts) * 100) 
      : 0;
      
    const overallConversionRate = uniqueVisits > 0 
      ? Math.round((uniqueCompletions / uniqueVisits) * 100) 
      : 0;
    
    const surveyFunnel: SurveyFunnelMetrics = {
      visits: uniqueVisits,
      uniqueUsers: uniqueVisits,
      started: uniqueStarts,
      completed: uniqueCompletions,
      startRate: `${surveyStartRate}%`,
      completionRate: `${surveyCompletionRate}%`,
      overallConversionRate: `${overallConversionRate}%`
    };
    
    // Survey type metrics
    const textSurveys = uniqueCounts?.survey_types?.text?.unique_users || 0;
    const imageSurveys = uniqueCounts?.survey_types?.image?.unique_users || 0;
    const otherSurveys = Object.entries(uniqueCounts?.survey_types || {})
      .filter(([key]) => !['text', 'image'].includes(key))
      .reduce((sum, [, value]) => {
        const count = (value as { unique_users?: number })?.unique_users || 0;
        return sum + count;
      }, 0);
    
    const surveyTypes = {
      text: textSurveys,
      image: imageSurveys,
      total: textSurveys + imageSurveys + otherSurveys
    };
    
    // Recommendations metrics
    const recommendationsMetrics = {
      pageVisits: uniqueCounts?.recommendations_page_visits?.unique_users || 0,
      companyInterestClicks: uniqueCounts?.company_interests?.total_clicks || 0,
      uniqueCompanyInterests: uniqueCounts?.company_interests?.unique_users || 0,
      companyInterestRate: `${uniqueCounts?.recommendations_page_visits?.unique_users > 0
        ? Math.round((uniqueCounts?.company_interests?.unique_users || 0) / 
                    (uniqueCounts?.recommendations_page_visits?.unique_users || 1) * 100)
        : 0}%`,
      averageCompaniesPerUser: uniqueCounts?.company_interests?.unique_users > 0
        ? Math.round((uniqueCounts?.company_interests?.total_clicks || 0) / 
                    (uniqueCounts?.company_interests?.unique_users || 1) * 10) / 10
        : 0
    };
    
    // Signup metrics
    const signupMetrics = {
      emailSignups: uniqueCounts?.signups?.email_signups || 0,
      googleSignups: uniqueCounts?.signups?.google_signups || 0,
      totalSignups: (uniqueCounts?.signups?.email_signups || 0) + 
                   (uniqueCounts?.signups?.google_signups || 0),
      uniqueEmailSignups: uniqueCounts?.signups?.unique_email_users || 0,
      uniqueGoogleSignups: uniqueCounts?.signups?.unique_google_users || 0,
      uniqueTotalSignups: uniqueCounts?.signups?.unique_users || 0
    };
    
    // Process survey step completion data
    const surveyStepMetrics = (uniqueCounts?.survey_steps || [])
      .map((step: SurveyStep) => ({
        id: step.step_id,
        count: step.unique_users,
        percentage: uniqueStarts > 0 
          ? `${Math.round((step.unique_users / uniqueStarts) * 100)}%` 
          : '0%',
        stepIndex: step.stepIndex || 0
      }))
      .sort((a: StepMetric, b: StepMetric) => (a.stepIndex || 0) - (b.stepIndex || 0));
    
    // Process drop-off analysis data
    const dropoffMetrics = (uniqueCounts?.survey_dropoffs || [])
      .map((step: SurveyDropoff) => ({
        id: step.step_id,
        label: formatStepLabel(step.step_id),
        completed: uniqueCounts?.survey_steps?.find((s: SurveyStep) => s.step_id === step.step_id)?.unique_users || 0,
        abandoned: step.unique_users,
        completionRate: `${Math.round((uniqueCounts?.survey_steps?.find((s: SurveyStep) => s.step_id === step.step_id)?.unique_users || 0) / 
                                    (step.unique_users + (uniqueCounts?.survey_steps?.find((s: SurveyStep) => s.step_id === step.step_id)?.unique_users || 0)) * 100)}%`,
        abandonmentRate: `${Math.round(step.unique_users / 
                                    (step.unique_users + (uniqueCounts?.survey_steps?.find((s: SurveyStep) => s.step_id === step.step_id)?.unique_users || 0)) * 100)}%`,
        avgTimeSpentSeconds: Math.round(step.avg_time_spent || 0),
        stepIndex: step.stepIndex || 0
      }))
      .sort((a: StepMetric, b: StepMetric) => (a.stepIndex || 0) - (b.stepIndex || 0));
    
    // Anonymous users metrics
    const anonymousMetrics = {
      total: uniqueCounts?.anonymous_users?.total_unique_users || 0,
      percentage: `${Math.round(((uniqueCounts?.anonymous_users?.total_unique_users || 0) / uniqueVisits) * 100)}%`,
      completionRate: `${Math.round(((uniqueCounts?.anonymous_users?.completed_surveys || 0) / 
                                   (uniqueCounts?.anonymous_users?.total_unique_users || 1)) * 100)}%`,
      conversionRate: `${Math.round(((uniqueCounts?.anonymous_users?.completed_surveys || 0) / uniqueVisits) * 100)}%`
    };

    // Calculate non-anonymous users metrics
    const nonAnonymousTotal = uniqueVisits - (uniqueCounts?.anonymous_users?.total_unique_users || 0);
    const nonAnonymousCompletions = uniqueCompletions - (uniqueCounts?.anonymous_users?.completed_surveys || 0);
    
    const nonAnonymousMetrics = {
      total: nonAnonymousTotal,
      percentage: `${Math.round((nonAnonymousTotal / uniqueVisits) * 100)}%`,
      completionRate: `${Math.round((nonAnonymousCompletions / Math.max(nonAnonymousTotal, 1)) * 100)}%`,
      conversionRate: `${Math.round((nonAnonymousCompletions / uniqueVisits) * 100)}%`
    };

    // Calculate differences for A/B test comparison
    const anonymousCompletionRate = Math.round(((uniqueCounts?.anonymous_users?.completed_surveys || 0) / 
                                              (uniqueCounts?.anonymous_users?.total_unique_users || 1)) * 100);
    const nonAnonymousCompletionRate = Math.round((nonAnonymousCompletions / Math.max(nonAnonymousTotal, 1)) * 100);
    const completionRateDiff = anonymousCompletionRate - nonAnonymousCompletionRate;

    const anonymousConversionRate = Math.round(((uniqueCounts?.anonymous_users?.completed_surveys || 0) / uniqueVisits) * 100);
    const nonAnonymousConversionRate = Math.round((nonAnonymousCompletions / uniqueVisits) * 100);
    const conversionRateDiff = anonymousConversionRate - nonAnonymousConversionRate;

    // A/B test comparison metrics
    const abTestComparison = {
      anonymous: anonymousMetrics,
      nonAnonymous: nonAnonymousMetrics,
      difference: {
        completionRate: `${completionRateDiff > 0 ? '+' : ''}${completionRateDiff}%`,
        conversionRate: `${conversionRateDiff > 0 ? '+' : ''}${conversionRateDiff}%`
      }
    };
    
    return NextResponse.json({
      events: data,
      eventCounts: typedEventCounts,
      stats: {
        totalEvents: data.length,
        surveyFunnel,
        surveyTypes,
        recommendations: recommendationsMetrics,
        signups: signupMetrics,
        surveySteps: surveyStepMetrics,
        dropoffAnalysis: dropoffMetrics,
        anonymousUsers: anonymousMetrics,
        abTestComparison
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