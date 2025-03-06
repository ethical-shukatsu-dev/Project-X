'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompanyCard from '@/components/recommendations/CompanyCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecommendationResult } from '@/lib/openai/client';

export default function RecommendationsPage() {
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
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">Oops!</h1>
          <p className="text-lg mb-8">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.href = '/questionnaire'}
          >
            Try Again
          </button>
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