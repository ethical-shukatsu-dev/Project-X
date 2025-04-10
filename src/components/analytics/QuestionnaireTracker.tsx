'use client';

import { useEffect } from 'react';
import { trackQuestionnaireStarted } from '@/lib/analytics';
import { useClarity } from '@/hooks/useClarity';

interface QuestionnaireTrackerProps {
  questionnaireType: string;
}

export default function QuestionnaireTracker({ questionnaireType }: QuestionnaireTrackerProps) {
  const { setTag } = useClarity();

  useEffect(() => {
    // Track the questionnaire start event when the component mounts
    trackQuestionnaireStarted(questionnaireType).catch((error) => {
      console.error('Error tracking questionnaire start:', error);
    });

    // Set tags in Clarity for better analysis
    setTag('questionnaire_type', questionnaireType);
    setTag('page_type', 'questionnaire');

    // We can also track the timestamp
    setTag('questionnaire_start_time', new Date().toISOString());
  }, [questionnaireType, setTag]);

  // This component doesn't render anything visible
  return null;
}
