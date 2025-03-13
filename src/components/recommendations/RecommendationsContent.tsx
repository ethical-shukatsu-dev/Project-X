"use client";

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import CompanyCard from "@/components/recommendations/CompanyCard";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {RecommendationResult} from "@/lib/openai/client";
import {useTranslation} from "@/i18n-client";

interface RecommendationsContentProps {
  lng: string;
}

export default function RecommendationsContent({
  lng,
}: RecommendationsContentProps) {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") || "";
  const {t, loaded} = useTranslation(lng, "ai");

  const [recommendations, setRecommendations] = useState<
    (RecommendationResult & {
      feedback?: "interested" | "not_interested";
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [streamingComplete, setStreamingComplete] = useState(true);
  const totalExpectedRecommendations = 5;

  useEffect(() => {
    const fetchRecommendations = async (refresh = false) => {
      if (!userId) {
        setError(t("recommendations.errors.missing_user_id"));
        setLoading(false);
        return;
      }

      try {
        // Clear existing recommendations if refreshing
        if (refresh) {
          setRecommendations([]);
        }

        // Always use streaming for better user experience
        const shouldStream = true;
        
        if (shouldStream) {
          // Use streaming API
          setStreamingComplete(false);
          
          // Show skeleton cards immediately
          setLoading(false);
          
          const response = await fetch(
            `/api/recommendations?userId=${userId}&locale=${lng}${
              refresh ? "&refresh=true" : ""
            }&stream=true`
          );

          if (!response.ok) {
            throw new Error(t("recommendations.errors.fetch_failed"));
          }

          // Get the response as a readable stream
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("Stream reader not available");
          }

          // Process the stream
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              // Process any remaining data in the buffer
              if (buffer.trim()) {
                try {
                  const data = JSON.parse(buffer);
                  if (data.recommendation) {
                    setRecommendations(prev => [...prev, data.recommendation]);
                  }
                } catch (e) {
                  console.error("Error parsing JSON from stream:", e);
                }
              }
              break;
            }

            // Decode the chunk and add it to our buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete JSON objects in the buffer
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
              
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data.recommendation) {
                    // Update recommendations immediately when each one arrives
                    setRecommendations(prev => [...prev, data.recommendation]);
                  }
                } catch (e) {
                  console.error("Error parsing JSON from stream:", e);
                }
              }
            }
          }
          
          setStreamingComplete(true);
        } else {
          // Use non-streaming API for initial load
          const response = await fetch(
            `/api/recommendations?userId=${userId}&locale=${lng}${
              refresh ? "&refresh=true" : ""
            }`
          );

          if (!response.ok) {
            throw new Error(t("recommendations.errors.fetch_failed"));
          }

          const data = await response.json();
          setRecommendations(data.recommendations);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(t("recommendations.errors.general"));
        setLoading(false);
        setRefreshing(false);
      }
    };

    if (loaded) {
      fetchRecommendations();
    }
  }, [userId, t, loaded, lng]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setRecommendations([]); // Clear existing recommendations immediately
    setStreamingComplete(false);
    
    const fetchRecommendations = async () => {
      if (!userId) {
        setError(t("recommendations.errors.missing_user_id"));
        setRefreshing(false);
        return;
      }

      try {
        // Use streaming for refresh
        const response = await fetch(
          `/api/recommendations?userId=${userId}&locale=${lng}&refresh=true&stream=true`
        );

        if (!response.ok) {
          throw new Error(t("recommendations.errors.fetch_failed"));
        }

        // Get the response as a readable stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Stream reader not available");
        }

        // Process the stream
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Process any remaining data in the buffer
            if (buffer.trim()) {
              try {
                const data = JSON.parse(buffer);
                if (data.recommendation) {
                  setRecommendations(prev => [...prev, data.recommendation]);
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e);
              }
            }
            break;
          }

          // Decode the chunk and add it to our buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete JSON objects in the buffer
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.recommendation) {
                  setRecommendations(prev => [...prev, data.recommendation]);
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e);
              }
            }
          }
        }
        
        setStreamingComplete(true);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(t("recommendations.errors.general"));
      } finally {
        setRefreshing(false);
      }
    };

    fetchRecommendations();
  };

  // Create a component for the skeleton card
  const SkeletonCompanyCard = () => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );

  const handleFeedback = async (
    recommendationId: string,
    feedback: "interested" | "not_interested"
  ) => {
    try {
      const response = await fetch("/api/recommendations/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recommendationId,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(t("recommendations.errors.feedback_failed"));
      }

      // Update local state
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId ? {...rec, feedback} : rec
        )
      );
    } catch (err) {
      console.error("Error submitting feedback:", err);
      // Show error message to user
    }
  };

  // Show loading state while translations are loading
  if (!loaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
        </div>
      </div>
    );
  }

  // Show full loading state only if we have no recommendations yet and we're not streaming
  if (loading && recommendations.length === 0 && streamingComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8">
            {t("recommendations.loading.title")}
          </h1>
          <p className="text-lg mb-8">
            {t("recommendations.loading.description")}
          </p>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-[200px] w-full mb-4" />
            <Skeleton className="h-[200px] w-full" />
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
              <CardTitle className="text-center">
                {t("recommendations.errors.title")}
              </CardTitle>
              <CardDescription className="text-center">{error}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => (window.location.href = `/${lng}/questionnaire`)}
              >
                {t("recommendations.errors.try_again")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const interestedRecommendations = recommendations.filter(
    (rec) => rec.feedback === "interested"
  );
  const notInterestedRecommendations = recommendations.filter(
    (rec) => rec.feedback === "not_interested"
  );
  const pendingRecommendations = recommendations.filter((rec) => !rec.feedback);

  // Create an array of skeleton cards to fill in the gaps
  const remainingSkeletons = !streamingComplete 
    ? Array(Math.max(0, totalExpectedRecommendations - recommendations.length)).fill(0).map((_, i) => i) 
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          {t("recommendations.title")}
        </h1>
        <p className="text-lg text-center mb-8">
          {t("recommendations.description")}
        </p>

        <div className="flex justify-between items-center mb-4">
          {!streamingComplete && (
            <div className="flex items-center text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {t("recommendations.loading.streaming")}
            </div>
          )}
          <div className={!streamingComplete ? "ml-auto" : "w-full flex justify-end"}>
            <Button
              onClick={handleRefresh}
              disabled={refreshing || !streamingComplete}
              variant="outline"
              className="flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("recommendations.refreshing")}
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {t("recommendations.refresh")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Always show the tabs if we're streaming or have recommendations */}
        {(recommendations.length > 0 || !streamingComplete) && (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex flex-wrap gap-2 h-full">
              <TabsTrigger value="all">
                {t("recommendations.tabs.all")} ({recommendations.length}{!streamingComplete && "+"})
              </TabsTrigger>
              <TabsTrigger value="pending">
                {t("recommendations.tabs.pending")} (
                {pendingRecommendations.length})
              </TabsTrigger>
              <TabsTrigger value="interested">
                {t("recommendations.tabs.interested")} (
                {interestedRecommendations.length})
              </TabsTrigger>
              <TabsTrigger value="not-interested">
                {t("recommendations.tabs.not_interested")} (
                {notInterestedRecommendations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6 space-y-6">
              {/* Show loaded recommendations */}
              {recommendations.map((recommendation) => (
                <CompanyCard
                  key={recommendation.id || recommendation.company.id}
                  company={recommendation.company}
                  matchingPoints={recommendation.matching_points}
                  feedback={recommendation.feedback}
                  onFeedback={(feedback) =>
                    recommendation.id &&
                    handleFeedback(recommendation.id, feedback)
                  }
                  lng={lng}
                />
              ))}
              
              {/* Show skeleton cards for recommendations that are still loading */}
              {remainingSkeletons.map((index) => (
                <SkeletonCompanyCard key={`skeleton-${index}`} />
              ))}
              
              {/* Show no matches message only when streaming is complete and there are no recommendations */}
              {streamingComplete && recommendations.length === 0 && (
                <div className="text-center py-8">
                  <p>{t("recommendations.no_matches")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6 space-y-6">
              {pendingRecommendations.length > 0 ? (
                pendingRecommendations.map((recommendation) => (
                  <CompanyCard
                    key={recommendation.id || recommendation.company.id}
                    company={recommendation.company}
                    matchingPoints={recommendation.matching_points}
                    feedback={recommendation.feedback}
                    onFeedback={(feedback) =>
                      recommendation.id &&
                      handleFeedback(recommendation.id, feedback)
                    }
                    lng={lng}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p>{t("recommendations.no_pending")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="interested" className="mt-6 space-y-6">
              {interestedRecommendations.length > 0 ? (
                interestedRecommendations.map((recommendation) => (
                  <CompanyCard
                    key={recommendation.id || recommendation.company.id}
                    company={recommendation.company}
                    matchingPoints={recommendation.matching_points}
                    feedback={recommendation.feedback}
                    onFeedback={(feedback) =>
                      recommendation.id &&
                      handleFeedback(recommendation.id, feedback)
                    }
                    lng={lng}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p>{t("recommendations.no_interested")}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="not-interested" className="mt-6 space-y-6">
              {notInterestedRecommendations.length > 0 ? (
                notInterestedRecommendations.map((recommendation) => (
                  <CompanyCard
                    key={recommendation.id || recommendation.company.id}
                    company={recommendation.company}
                    matchingPoints={recommendation.matching_points}
                    feedback={recommendation.feedback}
                    onFeedback={(feedback) =>
                      recommendation.id &&
                      handleFeedback(recommendation.id, feedback)
                    }
                    lng={lng}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p>{t("recommendations.no_not_interested")}</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Show loading indicator only when there are no recommendations yet */}
        {!streamingComplete && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="animate-spin h-10 w-10 text-primary mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-lg font-medium">{t("recommendations.loading.title")}</p>
            <p className="text-muted-foreground mt-2">{t("recommendations.loading.description")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
