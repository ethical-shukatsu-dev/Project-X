import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

// Define allowed time ranges
type TimeRange = '24h' | '7d' | '30d' | 'all';

// Define the event count type
interface EventCount {
  event_type: string;
  count: number;
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

// Define signup metrics
interface SignupMetrics {
  emailSignups: number;
  googleSignups: number;
  totalSignups: number;
  uniqueEmailSignups: number;
  uniqueGoogleSignups: number;
  uniqueTotalSignups: number;
}

// Define recommendations metrics
interface RecommendationsMetrics {
  pageVisits: number;
  companyInterestClicks: number;
  companyInterestRate: string;
  averageCompaniesPerUser: number;
}

// Define survey step completion metrics
interface SurveyStepMetrics {
  id: string;
  count: number;
  percentage: string;
  stepIndex: number;
}

// Define survey step dropoff metrics
interface SurveyStepDropoffMetrics {
  id: string;
  label: string;
  completed: number;
  abandoned: number;
  completionRate: string;
  abandonmentRate: string;
  avgTimeSpentSeconds: number;
  stepIndex: number;
}

// Define anonymous users metrics
interface AnonymousUserMetrics {
  total: number;
  percentage: string;
  conversionRate: string;
  completionRate: string;
}

// Define comparison metrics interface for A/B test results
interface ABTestComparisonMetrics {
  anonymous: {
    total: number;
    percentage: string;
    completionRate: string;
    conversionRate: string;
  };
  nonAnonymous: {
    total: number;
    percentage: string;
    completionRate: string;
    conversionRate: string;
  };
  difference: {
    completionRate: string;
    conversionRate: string;
  };
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

    // Get unique visitor counts for home page (both by session and user)
    const { data: uniqueVisitorCounts, error: visitorError } = await supabaseAdmin
      .rpc('get_unique_visitor_counts', { 
        start_date: startDate ? startDate.toISOString() : '2025-03-01',
        event_type_param: 'home_page_visit'
      });

    if (visitorError) {
      console.error('Error fetching unique visitors:', visitorError);
    }

    const homePageVisits = {
      uniqueSessions: uniqueVisitorCounts?.unique_sessions || 0,
      uniqueUsers: uniqueVisitorCounts?.unique_users || 0
    };
    
    // Cast the event counts to the proper type
    const typedEventCounts = (eventCounts || []) as EventCount[];
    
    // Calculate metrics based on event counts
    const findEventCount = (eventType: string): number => {
      return typedEventCounts.find(item => item.event_type === eventType)?.count || 0;
    };
    
    // Home page and survey funnel metrics
    const surveyStartClicks = findEventCount('survey_start_click');
    const surveyCompletions = findEventCount('survey_completed');
    
    const surveyStartRate = homePageVisits.uniqueUsers > 0 
      ? Math.round((surveyStartClicks / homePageVisits.uniqueUsers) * 100) 
      : 0;
      
    const surveyCompletionRate = surveyStartClicks > 0 
      ? Math.round((surveyCompletions / surveyStartClicks) * 100) 
      : 0;
      
    const overallConversionRate = homePageVisits.uniqueUsers > 0 
      ? Math.round((surveyCompletions / homePageVisits.uniqueUsers) * 100) 
      : 0;
    
    const surveyFunnel: SurveyFunnelMetrics = {
      visits: homePageVisits.uniqueUsers,
      uniqueUsers: homePageVisits.uniqueUsers,
      started: surveyStartClicks,
      completed: surveyCompletions,
      startRate: `${surveyStartRate}%`,
      completionRate: `${surveyCompletionRate}%`,
      overallConversionRate: `${overallConversionRate}%`
    };
    
    // Survey type metrics
    const textSurveys = data.filter(event => 
      event.event_type === 'survey_type_selected' && 
      event.properties?.surveyType === 'text'
    ).length;
    
    const imageSurveys = data.filter(event => 
      event.event_type === 'survey_type_selected' && 
      event.properties?.surveyType === 'image'
    ).length;
    
    // Recommendations metrics
    const recommendationsVisits = findEventCount('recommendations_page_visit');
    const companyInterestClicks = findEventCount('company_interested_click');
    
    // Calculate unique sessions that viewed recommendations page
    const uniqueRecommendationSessions = new Set(
      data.filter(event => event.event_type === 'recommendations_page_visit' && event.session_id)
        .map(event => event.session_id)
    ).size;
    
    // Calculate unique sessions that clicked company interest
    const uniqueCompanyInterestSessions = new Set(
      data.filter(event => event.event_type === 'company_interested_click' && event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const companyInterestRate = uniqueRecommendationSessions > 0
      ? Math.round((uniqueCompanyInterestSessions / uniqueRecommendationSessions) * 100)
      : 0;
      
    const avgCompaniesPerUser = uniqueCompanyInterestSessions > 0
      ? Math.round((companyInterestClicks / uniqueCompanyInterestSessions) * 10) / 10
      : 0;
    
    const recommendationsMetrics: RecommendationsMetrics = {
      pageVisits: recommendationsVisits,
      companyInterestClicks,
      companyInterestRate: `${companyInterestRate}%`,
      averageCompaniesPerUser: avgCompaniesPerUser
    };
    
    // Signup metrics
    const emailSignups = findEventCount('email_signup_click');
    const googleSignups = findEventCount('google_signup_click');
    const totalSignups = emailSignups + googleSignups;
    
    // Calculate unique sessions for signups
    const uniqueEmailSignupSessions = new Set(
      data.filter(event => event.event_type === 'email_signup_click' && event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const uniqueGoogleSignupSessions = new Set(
      data.filter(event => event.event_type === 'google_signup_click' && event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const uniqueTotalSignupSessions = new Set([
      ...data.filter(event => event.event_type === 'email_signup_click' && event.session_id)
        .map(event => event.session_id),
      ...data.filter(event => event.event_type === 'google_signup_click' && event.session_id)
        .map(event => event.session_id)
    ]).size;
    
    const signupMetrics: SignupMetrics = {
      emailSignups,
      googleSignups,
      totalSignups,
      uniqueEmailSignups: uniqueEmailSignupSessions,
      uniqueGoogleSignups: uniqueGoogleSignupSessions,
      uniqueTotalSignups: uniqueTotalSignupSessions
    };
    
    // Legacy metrics for backward compatibility
    const signupClicks = findEventCount('signup_click');
    const dialogCloses = findEventCount('dialog_close');
    
    const legacyConversionRate = dialogCloses > 0 
      ? Math.round((signupClicks / (signupClicks + dialogCloses)) * 100) 
      : 0;
    
    // Process survey step completion data
    const surveyStepEvents = data.filter(event => event.event_type === 'survey_step_completed');
    
    // Process drop-off analysis data
    const surveyStepAbandonedEvents = data.filter(event => event.event_type === 'survey_step_abandoned');
    console.log('DIAGNOSTICS - Total abandoned events from tracked data:', surveyStepAbandonedEvents.length);
    console.log('DIAGNOSTICS - Abandoned event sample:', 
                surveyStepAbandonedEvents.length > 0 
                  ? JSON.stringify(surveyStepAbandonedEvents[0]) 
                  : 'No abandoned events found');
    
    // For debugging session-specific events
    if (surveyStepAbandonedEvents.length > 0) {
      const abandonmentSessionIds = [...new Set(surveyStepAbandonedEvents
        .filter(event => event.session_id)
        .map(event => event.session_id))];
      
      console.log('DIAGNOSTICS - Session IDs with abandonments:', abandonmentSessionIds);
      
      // Also log start events for these sessions for comparison
      const relatedStartEvents = data.filter(
        event => event.event_type === 'survey_start_click' && 
                 event.session_id && 
                 abandonmentSessionIds.includes(event.session_id)
      );
      
      console.log('DIAGNOSTICS - Related survey start events:', 
                  relatedStartEvents.length > 0 
                    ? JSON.stringify(relatedStartEvents.map(e => ({ 
                        session_id: e.session_id, 
                        timestamp: e.timestamp 
                      }))) 
                    : 'No related start events found');
    }
    
    // Get all unique step IDs - include both completed and abandoned steps
    const stepIds = [...new Set([
      ...surveyStepEvents.map(event => event.properties?.stepId as string),
      ...surveyStepAbandonedEvents.map(event => event.properties?.stepId as string)
    ])].filter(Boolean);
    
    console.log('DIAGNOSTICS - Combined step IDs from completed and abandoned events:', JSON.stringify(stepIds));
    
    // Count completions for each step
    const surveyStepMetrics: SurveyStepMetrics[] = stepIds.map(stepId => {
      const count = surveyStepEvents.filter(
        event => event.properties?.stepId === stepId
      ).length;
      
      const percentage = surveyStartClicks > 0 
        ? `${Math.round((count / surveyStartClicks) * 100)}%` 
        : '0%';
      
      // Get the step index from any matching event
      const stepEvent = surveyStepEvents.find(event => event.properties?.stepId === stepId);
      // Also look in abandoned events if no completed event is found
      const abandonedStepEvent = !stepEvent ? surveyStepAbandonedEvents.find(
        event => event.properties?.stepId === stepId
      ) : null;
      
      // Use the first available step index
      const stepIndex = stepEvent?.properties?.stepIndex || 
                        abandonedStepEvent?.properties?.stepIndex || 
                        0;
      
      return {
        id: stepId,
        count,
        percentage,
        stepIndex
      };
    }).sort((a, b) => a.stepIndex - b.stepIndex);
    
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
    
    // Log diagnostic information for step IDs
    console.log('DIAGNOSTICS - Step IDs from completed events:', JSON.stringify(stepIds));
    console.log('DIAGNOSTICS - Total survey starts:', surveyStartClicks);
    
    // Prepare dropoff metrics
    const dropoffMetrics: SurveyStepDropoffMetrics[] = stepIds.map((stepId, index) => {
      // Count completions for this step
      const completed = surveyStepEvents.filter(
        event => event.properties?.stepId === stepId
      ).length;
      
      // Count actual abandonment events for this step from tracked events
      const actualAbandonments = surveyStepAbandonedEvents.filter(
        event => event.properties?.stepId === stepId
      ).length;

      console.log(`DIAGNOSTICS - Step ${stepId}: completed=${completed}, actualAbandonments=${actualAbandonments}`);
      
      // For our calculated values, use the actual tracked abandonment events
      // In a production environment, you would query the database directly here
      // instead of relying solely on filtered events
      const abandoned = actualAbandonments;

      // For the first step, total is the survey starts
      // For subsequent steps, total is the completions from the previous step
      let total = 0;
      if (index === 0) {
        total = surveyStartClicks;
      } else {
        const previousStepCompleted = surveyStepEvents.filter(
          event => event.properties?.stepId === stepIds[index - 1]
        ).length;
        total = previousStepCompleted;
      }

      console.log(`DIAGNOSTICS - Step ${stepId}: total=${total}`);

      // Ensure totals make sense mathematically
      if (completed + abandoned > total) {
        total = completed + abandoned;
        console.log(`DIAGNOSTICS - Step ${stepId}: Adjusted total=${total}`);
      }
      
      // Ensure abandoned is never negative
      const finalAbandoned = Math.max(0, abandoned);
      
      // Calculate rates using total as denominator
      const completionRate = total > 0 
        ? `${Math.round((completed / total) * 100)}%` 
        : '0%';
      
      const abandonmentRate = total > 0
        ? `${Math.round((finalAbandoned / total) * 100)}%`
        : '0%';
      
      console.log(`DIAGNOSTICS - Step ${stepId}: completionRate=${completionRate}, abandonmentRate=${abandonmentRate}`);
      
      // Calculate average time spent on this step
      const timeSpentValues = surveyStepAbandonedEvents
        .filter(event => event.properties?.stepId === stepId && 
                typeof event.properties?.timeSpentSeconds === 'number')
        .map(event => event.properties?.timeSpentSeconds as number);
      
      const avgTimeSpentSeconds = timeSpentValues.length > 0
        ? timeSpentValues.reduce((sum, time) => sum + time, 0) / timeSpentValues.length
        : 0;
      
      // Get the step index from any matching event
      const stepEvent = surveyStepEvents.find(event => event.properties?.stepId === stepId);
      // Also look in abandoned events if no completed event is found
      const abandonedStepEvent = !stepEvent ? surveyStepAbandonedEvents.find(
        event => event.properties?.stepId === stepId
      ) : null;
      
      // Use the first available step index
      const stepIndex = stepEvent?.properties?.stepIndex || 
                        abandonedStepEvent?.properties?.stepIndex || 
                        0;
      
      return {
        id: stepId,
        label: formatStepLabel(stepId),
        completed,
        abandoned: finalAbandoned,
        completionRate,
        abandonmentRate,
        avgTimeSpentSeconds,
        stepIndex
      };
    }).sort((a, b) => a.stepIndex - b.stepIndex);
    
    // Process anonymous user data
    const anonymousEvents = data.filter(event => 
      event.properties?.isAnonymous === true
    );
    
    const nonAnonymousEvents = data.filter(event => 
      event.properties?.isAnonymous === false
    );
    
    const totalUniqueSessionsCount = new Set(
      data.filter(event => event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const anonymousUniqueSessionsCount = new Set(
      anonymousEvents.filter(event => event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const anonymousPercentage = totalUniqueSessionsCount > 0
      ? Math.round((anonymousUniqueSessionsCount / totalUniqueSessionsCount) * 100)
      : 0;
    
    // Anonymous users survey completion metrics
    const anonymousSurveyCompletions = anonymousEvents.filter(
      event => event.event_type === 'survey_completed'
    ).length;
    
    const anonymousSurveyStarts = anonymousEvents.filter(
      event => event.event_type === 'survey_start_click'
    ).length;
    
    const anonymousCompletionRate = anonymousSurveyStarts > 0
      ? Math.round((anonymousSurveyCompletions / anonymousSurveyStarts) * 100)
      : 0;
    
    // Anonymous conversion rate (completed the survey out of all anonymous visitors)
    const anonymousVisitors = new Set(
      anonymousEvents.filter(event => event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const anonymousConversionRate = anonymousVisitors > 0
      ? Math.round((anonymousSurveyCompletions / anonymousVisitors) * 100)
      : 0;
    
    // Compile anonymous metrics
    const anonymousMetrics: AnonymousUserMetrics = {
      total: anonymousUniqueSessionsCount,
      percentage: `${anonymousPercentage}%`,
      completionRate: `${anonymousCompletionRate}%`,
      conversionRate: `${anonymousConversionRate}%`
    };
    
    // Non-anonymous users metrics
    const nonAnonymousUniqueSessionsCount = new Set(
      nonAnonymousEvents.filter(event => event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const nonAnonymousPercentage = totalUniqueSessionsCount > 0
      ? Math.round((nonAnonymousUniqueSessionsCount / totalUniqueSessionsCount) * 100)
      : 0;
    
    // Non-anonymous users survey completion metrics
    const nonAnonymousSurveyCompletions = nonAnonymousEvents.filter(
      event => event.event_type === 'survey_completed'
    ).length;
    
    const nonAnonymousSurveyStarts = nonAnonymousEvents.filter(
      event => event.event_type === 'survey_start_click'
    ).length;
    
    const nonAnonymousCompletionRate = nonAnonymousSurveyStarts > 0
      ? Math.round((nonAnonymousSurveyCompletions / nonAnonymousSurveyStarts) * 100)
      : 0;
    
    // Non-anonymous conversion rate (completed the survey out of all non-anonymous visitors)
    const nonAnonymousVisitors = new Set(
      nonAnonymousEvents.filter(event => event.session_id)
        .map(event => event.session_id)
    ).size;
    
    const nonAnonymousConversionRate = nonAnonymousVisitors > 0
      ? Math.round((nonAnonymousSurveyCompletions / nonAnonymousVisitors) * 100)
      : 0;
    
    // Calculate differences for comparison
    const completionRateDifference = anonymousCompletionRate - nonAnonymousCompletionRate;
    const conversionRateDifference = anonymousConversionRate - nonAnonymousConversionRate;
    
    // Compile A/B test comparison metrics
    const abTestComparison: ABTestComparisonMetrics = {
      anonymous: {
        total: anonymousUniqueSessionsCount,
        percentage: `${anonymousPercentage}%`,
        completionRate: `${anonymousCompletionRate}%`,
        conversionRate: `${anonymousConversionRate}%`,
      },
      nonAnonymous: {
        total: nonAnonymousUniqueSessionsCount,
        percentage: `${nonAnonymousPercentage}%`,
        completionRate: `${nonAnonymousCompletionRate}%`,
        conversionRate: `${nonAnonymousConversionRate}%`,
      },
      difference: {
        completionRate: `${completionRateDifference > 0 ? '+' : ''}${completionRateDifference}%`,
        conversionRate: `${conversionRateDifference > 0 ? '+' : ''}${conversionRateDifference}%`,
      }
    };
    
    return NextResponse.json({
      events: data,
      eventCounts: typedEventCounts,
      stats: {
        totalEvents: data.length,
        // Legacy stats
        signupClicks,
        dialogCloses,
        conversionRate: `${legacyConversionRate}%`,
        // New stats
        surveyFunnel,
        surveyTypes: {
          text: textSurveys,
          image: imageSurveys,
          total: textSurveys + imageSurveys
        },
        recommendations: recommendationsMetrics,
        signups: signupMetrics,
        // Survey step metrics
        surveySteps: surveyStepMetrics,
        // Dropoff analytics
        dropoffAnalysis: dropoffMetrics,
        // Anonymous users metrics
        anonymousUsers: anonymousMetrics,
        // A/B test comparison
        abTestComparison,
        // Diagnostic data
        diagnostics: {
          surveyStartClicks,
          totalAbandonments: surveyStepAbandonedEvents.length,
          abandonmentsByStep: stepIds.map(stepId => ({
            stepId,
            abandonments: surveyStepAbandonedEvents.filter(
              event => event.properties?.stepId === stepId
            ).length,
            reasons: [...new Set(surveyStepAbandonedEvents
              .filter(event => event.properties?.stepId === stepId && event.properties?.reason)
              .map(event => event.properties?.reason as string)
            )],
            sessionsWithCompletions: [...new Set(surveyStepEvents
              .filter(event => event.properties?.stepId === stepId && event.session_id)
              .map(event => event.session_id)
            )].length,
            sessionsWithAbandonments: [...new Set(surveyStepAbandonedEvents
              .filter(event => event.properties?.stepId === stepId && event.session_id)
              .map(event => event.session_id)
            )].length
          })),
          timeRange: timeRange
        }
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