"use client";

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import CompanyCard from "@/components/recommendations/CompanyCard";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {RecommendationResult} from "@/lib/openai/client";
import {useTranslation} from "@/i18n-client";
import SignupDialog from "@/components/recommendations/SignupDialog";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import {RECOMMENDATION_COUNT} from "@/lib/constants/recommendations";
import RecommendationTabs from "@/components/recommendations/RecommendationTabs";

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
  const [activeTab, setActiveTab] = useState("all");
  const [activeSizeTab, setActiveSizeTab] = useState("all-sizes");
  const [isSignupDialogOpen, setSignupDialogOpen] = useState(false);
  const [, setFeedbackCount] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async (refresh = false) => {
      if (!userId) {
        setError(t("recommendations.errors.missing_user_id"));
        setLoading(false);
        return;
      }

      try {
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
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(t("recommendations.errors.general"));
      } finally {
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
    const fetchRecommendations = async () => {
      if (!userId) {
        setError(t("recommendations.errors.missing_user_id"));
        setRefreshing(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/recommendations?userId=${userId}&locale=${lng}&refresh=true`
        );

        if (!response.ok) {
          throw new Error(t("recommendations.errors.fetch_failed"));
        }

        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(t("recommendations.errors.general"));
      } finally {
        setRefreshing(false);
      }
    };

    fetchRecommendations();
  };

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

      // Increment feedback count
      setFeedbackCount((prevCount) => {
        const newCount = prevCount + 1;

        // If this is the last recommendation, wait for the reveal animation
        // before showing the signup dialog
        if (newCount === RECOMMENDATION_COUNT) {
          // Wait for the reveal animation (2000ms) plus a small buffer
          setTimeout(() => {
            setSignupDialogOpen(true);
          }, 3000);
        }

        return newCount;
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      // Show error message to user
    }
  };

  // Function to get the filtered recommendations based on both tabs
  const getFilteredRecommendations = () => {
    // Helper function to determine company size category
    const getSizeCategory = (sizeText: string, industry?: string): string => {
      const normalizedSize = sizeText.toLowerCase();
      const normalizedIndustry = industry?.toLowerCase() || "";

      if (
        normalizedSize.includes("startup") ||
        normalizedSize.includes("スタートアップ") ||
        normalizedIndustry.includes("startup") ||
        normalizedIndustry.includes("スタートアップ")
      ) {
        return "startup";
      }
      if (normalizedSize.includes("small") || normalizedSize.includes("小")) {
        return "small";
      }
      if (normalizedSize.includes("medium") || normalizedSize.includes("中")) {
        return "medium";
      }
      if (normalizedSize.includes("large") || normalizedSize.includes("大")) {
        return "large";
      }
      return "unknown";
    };

    // First filter by feedback status
    let filtered = [...recommendations];
    if (activeTab === "interested") {
      filtered = filtered.filter((rec) => rec.feedback === "interested");
    } else if (activeTab === "not-interested") {
      filtered = filtered.filter((rec) => rec.feedback === "not_interested");
    } else if (activeTab === "pending") {
      filtered = filtered.filter((rec) => !rec.feedback);
    }

    // Then filter by size if not "all-sizes"
    if (activeSizeTab !== "all-sizes") {
      filtered = filtered.filter(
        (rec) =>
          getSizeCategory(rec.company.size, rec.company.industry) ===
          activeSizeTab.replace("-sizes", "")
      );
    }

    return filtered;
  };

  // Show loading state while translations are loading
  if (!loaded) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Skeleton className="w-1/3 h-8 mx-auto mb-4" />
          <Skeleton className="w-1/2 h-4 mx-auto mb-8" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {t("recommendations.loading.title")}
          </h1>
          <p className="mb-8 text-lg text-gray-300">
            {t("recommendations.loading.description")}
          </p>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-[200px] w-full mb-4 bg-white/10 border border-white/10 backdrop-blur-sm" />
            <Skeleton className="h-[200px] w-full mb-4 bg-white/10 border border-white/10 backdrop-blur-sm" />
            <Skeleton className="h-[200px] w-full bg-white/10 border border-white/10 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-md mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
            <CardHeader>
              <CardTitle className="text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                {t("recommendations.errors.title")}
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => (window.location.href = `/${lng}/questionnaire`)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {t("recommendations.errors.try_again")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 mx-auto sm:py-8">
      <div className="max-w-4xl mx-auto">
        <AnimatedContent direction="vertical" distance={40} delay={300}>
          <h1 className="mb-4 text-2xl font-bold text-center text-transparent sm:text-3xl md:text-4xl sm:mb-8 bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {t("recommendations.title")}
          </h1>
        </AnimatedContent>

        <AnimatedContent direction="vertical" distance={30} delay={450}>
          <p className="mb-4 text-base text-center text-gray-300 sm:text-lg sm:mb-8">
            {t("recommendations.description")}
          </p>
        </AnimatedContent>

        <RecommendationTabs
          lng={lng}
          recommendations={recommendations}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeSizeTab={activeSizeTab}
          setActiveSizeTab={setActiveSizeTab}
        />

        {/* Display filtered recommendations */}
        <div className="mt-3 space-y-4 sm:mt-6 sm:space-y-6">
          {getFilteredRecommendations().length > 0 ? (
            getFilteredRecommendations().map((recommendation, index) => (
              <AnimatedContent
                key={recommendation.id || recommendation.company.id}
                direction="vertical"
                distance={20}
                delay={index === 0 ? 900 : 100}
              >
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
              </AnimatedContent>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-300">{t("recommendations.no_matches")}</p>
            </div>
          )}
        </div>

        <AnimatedContent direction="vertical" distance={20} delay={100}>
          <div className="flex justify-end my-6">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="w-full flex items-center gap-2 text-sm sm:text-base bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 hover:shadow-blue-500/10"
            >
              {refreshing ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 -ml-1 animate-spin text-primary"
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
                    className="w-4 h-4"
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
        </AnimatedContent>

        <SignupDialog
          open={isSignupDialogOpen}
          onClose={() => setSignupDialogOpen(false)}
          lng={lng}
          recommendations={recommendations}
        />
      </div>
    </div>
  );
}
