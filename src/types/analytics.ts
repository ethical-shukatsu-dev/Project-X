/**
 * Shared analytics type definitions used across frontend and backend
 */

// Define allowed time ranges
export type TimeRange = "24h" | "7d" | "30d" | "all";

// Types for analytics event data
export interface AnalyticsEvent {
  id: string;
  event_type: string;
  timestamp: string;
  session_id?: string;
  user_id?: string;
  properties?: Record<string, unknown>;
  created_at: string;
}

export interface EventCount {
  event_type: string;
  count: number;
}

// Base interface for step-related metrics
export interface StepMetric {
  stepIndex?: number;
}

// Survey step interfaces
export interface SurveyStep {
  step_id: string;
  unique_users: number;
  stepIndex?: number;
}

export interface SurveyStepMetric extends StepMetric {
  id: string;
  count: number;
  percentage: string;
  stepIndex?: number;
}

// Survey drop-off interfaces
export interface SurveyDropoff {
  step_id: string;
  unique_users: number;
  avg_time_spent?: number;
  stepIndex?: number;
}

export interface StepDropoffMetric {
  id: string;
  label: string;
  completed: number;
  abandoned: number;
  completionRate: string;
  avgTimeSpentSeconds: number;
  stepIndex?: number;
}

// Define survey funnel metrics
export interface SurveyFunnelMetrics {
  visits: number;
  uniqueUsers: number;
  started: number;
  completed: number;
  startRate: string;
  completionRate: string;
  overallConversionRate: string;
  anonymousStarts: number;
  nonAnonymousStarts: number;
}

// Define anonymous user metrics type
export interface AnonymousUserMetrics {
  total: number;
  percentage: string;
  conversionRate: string;
  completionRate: string;
}

// Define A/B test comparison metrics type
export interface ABTestComparisonMetrics {
  anonymous: AnonymousUserMetrics;
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

// Define recommendations metrics
export interface RecommendationsMetrics {
  pageVisits: number;
  companyInterestClicks: number;
  uniqueCompanyInterests: number;
  companyInterestRate: string;
  averageCompaniesPerUser: number;
}

// Define signup metrics
export interface SignupMetrics {
  emailSignups: number;
  googleSignups: number;
  totalSignups: number;
  uniqueEmailSignups: number;
  uniqueGoogleSignups: number;
  uniqueTotalSignups: number;
}

// Survey type metrics
export interface SurveyTypeMetrics {
  text: number;
  image: number;
  total: number;
}

// Interface for the complete analytics data structure
export interface AnalyticsData {
  events: AnalyticsEvent[];
  eventCounts: EventCount[];
  stats: {
    totalEvents: number;
    signupClicks?: number;
    dialogCloses: number;
    uniqueDialogCloses: number;
    dialogCloseConversionRate: string;
    conversionRate?: string;
    surveyFunnel: SurveyFunnelMetrics;
    surveyTypes: SurveyTypeMetrics;
    recommendations: RecommendationsMetrics;
    signups: SignupMetrics;
    surveySteps: SurveyStepMetric[];
    dropoffAnalysis: StepDropoffMetric[];
    anonymousUsers: AnonymousUserMetrics;
    abTestComparison: ABTestComparisonMetrics;
  };
}

// Define a type for partial analytics data returned for individual metrics
export type PartialAnalyticsData = {
  stats: {
    surveyFunnel?: Partial<SurveyFunnelMetrics>;
    surveyTypes?: Partial<SurveyTypeMetrics>;
    signups?: Partial<SignupMetrics>;
    recommendations?: Partial<RecommendationsMetrics>;
    surveySteps?: SurveyStepMetric[];
    dropoffAnalysis?: StepDropoffMetric[];
    anonymousUsers?: Partial<AnonymousUserMetrics>;
    abTestComparison?: Partial<ABTestComparisonMetrics>;
    dialogCloses?: number;
    uniqueDialogCloses?: number;
    dialogCloseConversionRate?: string;
    [key: string]: unknown;
  };
};

// Define error response type
export type ErrorResponse = {
  error: string;
}; 