'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompanyCard from '@/components/recommendations/CompanyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationResult } from '@/lib/openai/client';

export default function RecommendationsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [recommendations, setRecommendations] = useState<(RecommendationResult & { id?: string; feedback?: 'interested' | 'not_interested' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/recommendations?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  const handleFeedback = async (recommendationId: string, feedback: 'interested' | 'not_interested') => {
    try {
      const response = await fetch('/api/recommendations/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Update local state
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId ? { ...rec, feedback } : rec
        )
      );
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Show error message to user
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Finding Your Matches...</h1>
          <p className="text-lg mb-8">
            We&apos;re analyzing your values and preferences to find the best company matches for you.
          </p>
          <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Oops!</CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.href = '/questionnaire'}>
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const interestedRecommendations = recommendations.filter(
    (rec) => rec.feedback === 'interested'
  );
  const notInterestedRecommendations = recommendations.filter(
    (rec) => rec.feedback === 'not_interested'
  );
  const pendingRecommendations = recommendations.filter(
    (rec) => !rec.feedback
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Your Company Matches</h1>
        <p className="text-lg text-center mb-8">
          Based on your values and interests, we&apos;ve found these companies that might be a good fit for you.
        </p>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({recommendations.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingRecommendations.length})</TabsTrigger>
            <TabsTrigger value="interested">Interested ({interestedRecommendations.length})</TabsTrigger>
            <TabsTrigger value="not-interested">Not Interested ({notInterestedRecommendations.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6 space-y-6">
            {recommendations.map((recommendation) => (
              <CompanyCard
                key={recommendation.id || recommendation.company.id}
                company={recommendation.company}
                matchingPoints={recommendation.matchingPoints}
                score={recommendation.score}
                feedback={recommendation.feedback}
                onFeedback={(feedback) => 
                  recommendation.id && handleFeedback(recommendation.id, feedback)
                }
              />
            ))}
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6 space-y-6">
            {pendingRecommendations.map((recommendation) => (
              <CompanyCard
                key={recommendation.id || recommendation.company.id}
                company={recommendation.company}
                matchingPoints={recommendation.matchingPoints}
                score={recommendation.score}
                feedback={recommendation.feedback}
                onFeedback={(feedback) => 
                  recommendation.id && handleFeedback(recommendation.id, feedback)
                }
              />
            ))}
          </TabsContent>
          
          <TabsContent value="interested" className="mt-6 space-y-6">
            {interestedRecommendations.map((recommendation) => (
              <CompanyCard
                key={recommendation.id || recommendation.company.id}
                company={recommendation.company}
                matchingPoints={recommendation.matchingPoints}
                score={recommendation.score}
                feedback={recommendation.feedback}
                onFeedback={(feedback) => 
                  recommendation.id && handleFeedback(recommendation.id, feedback)
                }
              />
            ))}
          </TabsContent>
          
          <TabsContent value="not-interested" className="mt-6 space-y-6">
            {notInterestedRecommendations.map((recommendation) => (
              <CompanyCard
                key={recommendation.id || recommendation.company.id}
                company={recommendation.company}
                matchingPoints={recommendation.matchingPoints}
                score={recommendation.score}
                feedback={recommendation.feedback}
                onFeedback={(feedback) => 
                  recommendation.id && handleFeedback(recommendation.id, feedback)
                }
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 