import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Company } from '@/lib/supabase/client';

interface CompanyCardProps {
  company: Company;
  matchingPoints: string[];
  score: number;
  onFeedback: (feedback: 'interested' | 'not_interested') => void;
  feedback?: 'interested' | 'not_interested';
}

export default function CompanyCard({
  company,
  matchingPoints,
  score,
  onFeedback,
  feedback,
}: CompanyCardProps) {
  // Get company initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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
          <span className="text-xs text-muted-foreground">Match</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">About</h3>
          <p className="text-sm text-muted-foreground">{company.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Why it&apos;s a match</h3>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {matchingPoints && matchingPoints.length > 0 ? (
              matchingPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))
            ) : (
              <li>No specific matching points available</li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {feedback ? (
          <div className="w-full text-center text-sm text-muted-foreground">
            You marked this as {feedback === 'interested' ? 'interesting' : 'not interesting'}
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => onFeedback('not_interested')}
            >
              Not Interested
            </Button>
            <Button
              onClick={() => onFeedback('interested')}
            >
              Interested
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
} 