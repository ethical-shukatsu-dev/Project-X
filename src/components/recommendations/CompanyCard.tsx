import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '@/lib/supabase/client';
import { useTranslation } from '@/i18n-client';

interface CompanyCardProps {
  company: Company;
  matchingPoints: string[];
  score: number;
  onFeedback: (feedback: 'interested' | 'not_interested') => void;
  feedback?: 'interested' | 'not_interested';
  lng: string;
}

export default function CompanyCard({
  company,
  matchingPoints,
  score,
  onFeedback,
  feedback,
  lng,
}: CompanyCardProps) {
  const { t, loaded } = useTranslation(lng, 'ai');
  
  // Get company initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // If translations are not loaded yet, show a loading state
  if (!loaded) {
    return <Card className="w-full p-6">Loading...</Card>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          {company.logo_url ? (
            <AvatarImage src={company.logo_url} alt={company.name} />
          ) : null}
          <AvatarFallback>{getInitials(company.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{company.name}</CardTitle>
          <CardDescription>
            {company.industry} • {company.size}
          </CardDescription>
        </div>
        <div className="ml-auto flex flex-col items-center">
          <span className="text-2xl font-bold">{score}%</span>
          <span className="text-xs text-muted-foreground">{t('recommendations.matchScore')}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">{t('recommendations.about')}</h3>
          <p className="text-sm text-muted-foreground">{company.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">{t('recommendations.whyMatch')}</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {matchingPoints && matchingPoints.length > 0 ? (
              matchingPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))
            ) : (
              <li>{t('recommendations.noMatchingPoints')}</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {feedback ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            {feedback === 'interested' 
              ? t('recommendations.feedback.markedInterested') 
              : t('recommendations.feedback.markedNotInterested')}
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onFeedback('not_interested')}
            >
              {t('recommendations.feedback.notInterested')}
            </Button>
            <Button
              onClick={() => onFeedback('interested')}
            >
              {t('recommendations.feedback.interested')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 