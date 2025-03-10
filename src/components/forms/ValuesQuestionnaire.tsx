"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserValues } from '@/lib/supabase/client';
import { useTranslation } from '@/i18n-client';

// Define the questions for the questionnaire
const QUESTIONS = [
  {
    id: 'work_environment',
    questionKey: 'questionnaire.questions.work_environment.question',
    options: [
      { value: 'collaborative', labelKey: 'questionnaire.questions.work_environment.options.collaborative' },
      { value: 'autonomous', labelKey: 'questionnaire.questions.work_environment.options.autonomous' },
      { value: 'structured', labelKey: 'questionnaire.questions.work_environment.options.structured' },
      { value: 'flexible', labelKey: 'questionnaire.questions.work_environment.options.flexible' },
    ],
  },
  {
    id: 'company_culture',
    questionKey: 'questionnaire.questions.company_culture.question',
    options: [
      { value: 'innovation', labelKey: 'questionnaire.questions.company_culture.options.innovation' },
      { value: 'work_life_balance', labelKey: 'questionnaire.questions.company_culture.options.work_life_balance' },
      { value: 'growth', labelKey: 'questionnaire.questions.company_culture.options.growth' },
      { value: 'social_impact', labelKey: 'questionnaire.questions.company_culture.options.social_impact' },
    ],
  },
  {
    id: 'leadership_style',
    questionKey: 'questionnaire.questions.leadership_style.question',
    options: [
      { value: 'mentorship', labelKey: 'questionnaire.questions.leadership_style.options.mentorship' },
      { value: 'empowerment', labelKey: 'questionnaire.questions.leadership_style.options.empowerment' },
      { value: 'transparent', labelKey: 'questionnaire.questions.leadership_style.options.transparent' },
      { value: 'results_oriented', labelKey: 'questionnaire.questions.leadership_style.options.results_oriented' },
    ],
  },
  {
    id: 'company_size',
    questionKey: 'questionnaire.questions.company_size.question',
    options: [
      { value: 'startup', labelKey: 'questionnaire.questions.company_size.options.startup' },
      { value: 'small', labelKey: 'questionnaire.questions.company_size.options.small' },
      { value: 'medium', labelKey: 'questionnaire.questions.company_size.options.medium' },
      { value: 'large', labelKey: 'questionnaire.questions.company_size.options.large' },
    ],
  },
  {
    id: 'work_priorities',
    questionKey: 'questionnaire.questions.work_priorities.question',
    options: [
      { value: 'compensation', labelKey: 'questionnaire.questions.work_priorities.options.compensation' },
      { value: 'learning', labelKey: 'questionnaire.questions.work_priorities.options.learning' },
      { value: 'impact', labelKey: 'questionnaire.questions.work_priorities.options.impact' },
      { value: 'stability', labelKey: 'questionnaire.questions.work_priorities.options.stability' },
    ],
  },
];

// Define the interest areas
const INTERESTS = [
  { value: 'technology', labelKey: 'questionnaire.interests.technology' },
  { value: 'healthcare', labelKey: 'questionnaire.interests.healthcare' },
  { value: 'finance', labelKey: 'questionnaire.interests.finance' },
  { value: 'education', labelKey: 'questionnaire.interests.education' },
  { value: 'sustainability', labelKey: 'questionnaire.interests.sustainability' },
  { value: 'retail', labelKey: 'questionnaire.interests.retail' },
  { value: 'manufacturing', labelKey: 'questionnaire.interests.manufacturing' },
  { value: 'media', labelKey: 'questionnaire.interests.media' },
  { value: 'consulting', labelKey: 'questionnaire.interests.consulting' },
  { value: 'nonprofit', labelKey: 'questionnaire.interests.nonprofit' },
];

interface ValuesQuestionnaireProps {
  lng: string;
}

export default function ValuesQuestionnaire({ lng }: ValuesQuestionnaireProps) {
  const router = useRouter();
  const { t, loaded } = useTranslation(lng, 'ai');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [values, setValues] = useState<Record<string, string>>({});
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleValueChange = (questionId: string, value: string) => {
    setValues((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    if (checked) {
      setInterests((prev) => [...prev, interest]);
    } else {
      setInterests((prev) => prev.filter((i) => i !== interest));
    }
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Show interests selection
      setCurrentQuestion(QUESTIONS.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert values to numeric format for better AI processing
      const numericValues: Record<string, number> = {};
      // Use Object.values instead of Object.entries to avoid unused variables
      Object.values(values).forEach(value => {
        // Assign a value of 5 (on a scale of 1-5) to indicate strong preference
        numericValues[value] = 5;
      });

      // Create user values object
      const userValues: Partial<UserValues> = {
        values: numericValues,
        interests: interests,
      };

      // Submit to API
      const response = await fetch('/api/values', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userValues),
      });

      if (!response.ok) {
        throw new Error('Failed to save values');
      }

      const data = await response.json();
      
      // Redirect to recommendations page with locale and userId
      router.push(`/${lng}/recommendations?userId=${data.userId}&locale=${lng}`);
    } catch (error) {
      console.error('Error submitting values:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // If translations are not loaded yet, show a loading state
  if (!loaded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  // Render the current question
  const renderQuestion = () => {
    if (currentQuestion < QUESTIONS.length) {
      const question = QUESTIONS[currentQuestion];
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">
              {t('questionnaire.progress', { current: currentQuestion + 1, total: QUESTIONS.length })}
            </CardTitle>
            <CardDescription className="text-lg">{t(question.questionKey)}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={values[question.id] || ''}
              onValueChange={(value) => handleValueChange(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-base">
                    {t(option.labelKey)}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              {t('questionnaire.previous')}
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!values[question.id]}
            >
              {t('questionnaire.next')}
            </Button>
          </CardFooter>
        </>
      );
    } else {
      // Render interests selection
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">{t('questionnaire.interests.title')}</CardTitle>
            <CardDescription className="text-lg">
              {t('questionnaire.interests.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {INTERESTS.map((interest) => (
                <div key={interest.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={interest.value} 
                    checked={interests.includes(interest.value)}
                    onCheckedChange={(checked) => 
                      handleInterestChange(interest.value, checked === true)
                    }
                  />
                  <Label htmlFor={interest.value} className="text-base">
                    {t(interest.labelKey)}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
            >
              {t('questionnaire.previous')}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={interests.length === 0 || isSubmitting}
            >
              {isSubmitting ? t('questionnaire.submitting') : t('questionnaire.submit')}
            </Button>
          </CardFooter>
        </>
      );
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderQuestion()}
    </Card>
  );
} 