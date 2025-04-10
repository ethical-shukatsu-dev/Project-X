# Microsoft Clarity Integration

This document explains how Microsoft Clarity has been integrated into the Project-X codebase for user behavior analytics and session recording.

## Overview

Microsoft Clarity provides heatmaps, session recordings, and insights about user behavior on your website. It has been integrated with Project-X to enhance understanding of user interactions, particularly in critical user journeys like the questionnaire and recommendations flow.

## Configuration

### Environment Variables

Clarity requires the following environment variables:

```
# Microsoft Clarity Configuration
NEXT_PUBLIC_CLARITY_PROJECT_ID=your_clarity_project_id
# Set to 'true' to enable Clarity in development
# NEXT_PUBLIC_ENABLE_CLARITY=true
```

By default, Clarity is only enabled in production environments. To enable it in development, set `NEXT_PUBLIC_ENABLE_CLARITY=true`.

### Getting a Clarity Project ID

1. Sign up or log in to [Microsoft Clarity](https://clarity.microsoft.com/)
2. Create a new project
3. Get the Project ID from your project settings
4. Add the Project ID to your `.env.local` file as `NEXT_PUBLIC_CLARITY_PROJECT_ID`

## Implementation Details

### Core Components

1. **ClarityProvider** (`src/components/ClarityProvider.tsx`)

   - Conditionally initializes Clarity based on environment settings
   - Wraps the application to ensure Clarity is available throughout

2. **MicrosoftClarity** (`src/components/MicrosoftClarity.tsx`)

   - Handles the actual initialization of Clarity
   - Isolates Clarity-specific code for easier maintenance

3. **useClarity Hook** (`src/hooks/useClarity.ts`)
   - Provides utility functions for interacting with Clarity
   - Includes methods for setting tags, identifying users, and managing consent

### Clarity Configuration

Configuration settings are managed in `src/lib/clarity.ts`:

- `CLARITY_PROJECT_ID`: The Clarity project ID from environment variables
- `CLARITY_ENABLED`: Controls when Clarity is active (production by default)

### Page-Specific Tracking

Several analytics components have been created to track key user flows:

1. **HomePageTracker** - Tracks visits to the home page
2. **QuestionnaireTracker** - Tracks questionnaire interactions
3. **RecommendationsTracker** - Tracks interactions with company recommendations

### Utility Functions

Clarity utility functions in `src/lib/clarityUtils.ts` provide:

- `trackPageView()` - Tracks page views with custom metadata
- `trackAuthenticatedUser()` - Associates user data with Clarity sessions

## Privacy Considerations

- Clarity is integrated with consent management
- The `setConsent()` method can be used to disable tracking for users who don't consent
- Ensure your privacy policy includes information about Clarity usage

## Debugging

- Check browser console for "Microsoft Clarity initialized successfully" message
- Clarity events are logged to the console in development mode
- Issues with Clarity initialization are captured in error logs

## Custom Event Tracking

To add custom event tracking to a component:

```tsx
import { useClarity } from '@/hooks/useClarity';

function MyComponent() {
  const { setTag } = useClarity();

  const handleAction = () => {
    // Track a user action
    setTag('user_action', 'button_clicked');
  };

  return <button onClick={handleAction}>Click Me</button>;
}
```

## User Identification

To identify authenticated users:

```tsx
import { trackAuthenticatedUser } from '@/lib/clarityUtils';

// After successful authentication
trackAuthenticatedUser(user.id, {
  name: user.name,
  email: user.email,
  role: user.role,
});
```

## Integration with Previous Analytics System

The Clarity implementation was integrated with the project's previous analytics system to maintain backward compatibility. This integration ensures that:

1. All existing analytics function calls in components continue to work
2. Events are tracked both in Clarity and in the existing backend analytics system
3. No changes were needed to existing components that use analytics tracking

### Key Functions Preserved:

- `trackEvent` - Generic event tracking
- `trackSignupClick` - Track signup button clicks
- `trackSurveyStartClick` - Track survey start actions
- `trackSurveyTypeSelection` - Track questionnaire type selection
- `trackSurveyStepCompleted` - Track completion of survey steps
- `trackSurveyStepAbandoned` - Track abandoned survey steps
- `trackSurveyCompleted` - Track survey completion
- `trackRecommendationsPageVisit` - Track recommendations page views
- `trackCompanyInterestedClick` - Track interest in specific companies
- `trackEmailSignupClick` - Track email signup
- `trackGoogleSignupClick` - Track Google signup

### Implementation Details

The existing analytics system (`src/lib/analytics/index.ts`) was combined with the new Clarity implementation (`src/lib/analytics.ts`). The merged implementation:

1. Preserves all existing function signatures
2. Uses Clarity tracking for all events
3. Maintains backward compatibility with the existing analytics backend

This integration provides richer analytics data by tracking user behavior through both systems simultaneously.
