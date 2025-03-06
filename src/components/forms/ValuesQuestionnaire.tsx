"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserValues } from '@/lib/supabase/client';

// Define the questions for the questionnaire
const QUESTIONS = [
  {
    id: 'work_environment',
    question: 'What type of work environment do you prefer?',
    options: [
      { value: 'collaborative', label: 'Collaborative and team-oriented' },
      { value: 'autonomous', label: 'Autonomous and independent' },
      { value: 'structured', label: 'Structured and organized' },
      { value: 'flexible', label: 'Flexible and adaptable' },
    ],
  },
  {
    id: 'company_culture',
    question: 'What company culture aspects are most important to you?',
    options: [
      { value: 'innovation', label: 'Innovation and creativity' },
      { value: 'work_life_balance', label: 'Work-life balance' },
      { value: 'growth', label: 'Professional growth opportunities' },
      { value: 'social_impact', label: 'Social impact and purpose' },
    ],
  },
  {
    id: 'leadership_style',
    question: 'What leadership style do you work best with?',
    options: [
      { value: 'mentorship', label: 'Mentorship and guidance' },
      { value: 'empowerment', label: 'Empowerment and autonomy' },
      { value: 'transparent', label: 'Transparent and open communication' },
      { value: 'results_oriented', label: 'Results-oriented and direct' },
    ],
  },
  {
    id: 'company_size',
    question: 'What size of company do you prefer?',
    options: [
      { value: 'startup', label: 'Startup (1-50 employees)' },
      { value: 'small', label: 'Small (51-200 employees)' },
      { value: 'medium', label: 'Medium (201-1000 employees)' },
      { value: 'large', label: 'Large (1000+ employees)' },
    ],
  },
  {
    id: 'work_priorities',
    question: 'What are your top priorities in a job?',
    options: [
      { value: 'compensation', label: 'Competitive compensation' },
      { value: 'learning', label: 'Learning and skill development' },
      { value: 'impact', label: 'Making a meaningful impact' },
      { value: 'stability', label: 'Job stability and security' },
    ],
  },
];

// Define the interest areas
const INTERESTS = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'retail', label: 'Retail' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'nonprofit', label: 'Nonprofit' },
];

export default function ValuesQuestionnaire() {
  const router = useRouter();
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
      
      // Redirect to recommendations page
      router.push(`/recommendations?userId=${data.userId}`);
    } catch (error) {
      console.error('Error submitting values:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current question
  const renderQuestion = () => {
    if (currentQuestion < QUESTIONS.length) {
      const question = QUESTIONS[currentQuestion];
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">Question {currentQuestion + 1} of {QUESTIONS.length}</CardTitle>
            <CardDescription className="text-lg">{question.question}</CardDescription>
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
                    {option.label}
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
              Previous
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!values[question.id]}
            >
              Next
            </Button>
          </CardFooter>
        </>
      );
    } else {
      // Render interests selection
      return (
        <>
          <CardHeader>
            <CardTitle className="text-xl">Select Your Interests</CardTitle>
            <CardDescription className="text-lg">
              Choose industries or areas you&apos;re interested in exploring.
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
                    {interest.label}
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
              Previous
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={interests.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Get Recommendations'}
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