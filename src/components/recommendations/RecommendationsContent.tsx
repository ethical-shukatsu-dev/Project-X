"use client";

import {useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import CompanyCard from "@/components/recommendations/CompanyCard";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
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
    } catch (err) {
      console.error("Error submitting feedback:", err);
      // Show error message to user
    }
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
          <h1 className="mb-8 text-3xl font-bold">
            {t("recommendations.loading.title")}
          </h1>
          <p className="mb-8 text-lg">
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
      <div className="container px-4 py-8 mx-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-md mx-auto">
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

  // Helper function to determine company size category
  const getSizeCategory = (sizeText: string, industry?: string): string => {
    const normalizedSize = sizeText.toLowerCase();
    const normalizedIndustry = industry?.toLowerCase() || "";

    // Check for startup - also consider industry
    if (
      normalizedSize.includes("startup") ||
      normalizedSize.includes("スタートアップ") ||
      normalizedIndustry.includes("startup") ||
      normalizedIndustry.includes("スタートアップ")
    ) {
      return "startup";
    }

    // Check for small
    if (normalizedSize.includes("small") || normalizedSize.includes("小")) {
      return "small";
    }

    // Check for medium - also check for cases where a company might be between small and large
    if (normalizedSize.includes("medium") || normalizedSize.includes("中")) {
      return "medium";
    }

    // Check for large
    if (normalizedSize.includes("large") || normalizedSize.includes("大")) {
      return "large";
    }

    // Default to unknown if no match
    return "unknown";
  };

  // Filter recommendations by company size using the helper function
  const startupRecommendations = recommendations.filter(
    (rec) =>
      getSizeCategory(rec.company.size, rec.company.industry) === "startup"
  );

  const smallRecommendations = recommendations.filter(
    (rec) => getSizeCategory(rec.company.size, rec.company.industry) === "small"
  );

  const mediumRecommendations = recommendations.filter(
    (rec) =>
      getSizeCategory(rec.company.size, rec.company.industry) === "medium"
  );

  const largeRecommendations = recommendations.filter(
    (rec) => getSizeCategory(rec.company.size, rec.company.industry) === "large"
  );

  // Function to get the filtered recommendations based on both tabs
  const getFilteredRecommendations = () => {
    // First filter by feedback status
    let filtered: (RecommendationResult & {
      feedback?: "interested" | "not_interested";
    })[] = [];
    if (activeTab === "all") {
      filtered = [...recommendations];
    } else if (activeTab === "interested") {
      filtered = [...interestedRecommendations];
    } else if (activeTab === "not-interested") {
      filtered = [...notInterestedRecommendations];
    } else if (activeTab === "pending") {
      filtered = [...pendingRecommendations];
    }

    // Then filter by size if not "all-sizes"
    if (activeSizeTab === "all-sizes") {
      return filtered;
    } else if (activeSizeTab === "startup") {
      return filtered.filter(
        (rec) =>
          getSizeCategory(rec.company.size, rec.company.industry) === "startup"
      );
    } else if (activeSizeTab === "small") {
      return filtered.filter(
        (rec) =>
          getSizeCategory(rec.company.size, rec.company.industry) === "small"
      );
    } else if (activeSizeTab === "medium") {
      return filtered.filter(
        (rec) =>
          getSizeCategory(rec.company.size, rec.company.industry) === "medium"
      );
    } else if (activeSizeTab === "large") {
      return filtered.filter(
        (rec) =>
          getSizeCategory(rec.company.size, rec.company.industry) === "large"
      );
    }

    return filtered;
  };

  console.log("recommendations", recommendations);

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-center">
          {t("recommendations.title")}
        </h1>
        <p className="mb-8 text-lg text-center">
          {t("recommendations.description")}
        </p>

        <div className="flex justify-end mb-4">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="flex items-center gap-2"
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

        {/* Feedback Status Tabs */}
        <Tabs
          defaultValue="all"
          className="w-full mb-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="flex flex-wrap h-full gap-2">
            <TabsTrigger value="all">
              {t("recommendations.tabs.all")} ({recommendations.length})
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
        </Tabs>

        {/* Company Size Tabs */}
        <Tabs
          defaultValue="all-sizes"
          className="w-full mb-6"
          value={activeSizeTab}
          onValueChange={setActiveSizeTab}
        >
          <TabsList className="flex flex-wrap h-full gap-2">
            <TabsTrigger value="all-sizes">
              {t("recommendations.size_tabs.all")} ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger value="startup">
              {t("recommendations.size_tabs.startup")} (
              {startupRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="small">
              {t("recommendations.size_tabs.small")} (
              {smallRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="medium">
              {t("recommendations.size_tabs.medium")} (
              {mediumRecommendations.length})
            </TabsTrigger>
            <TabsTrigger value="large">
              {t("recommendations.size_tabs.large")} (
              {largeRecommendations.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Display filtered recommendations */}
        <div className="mt-6 space-y-6">
          {getFilteredRecommendations().length > 0 ? (
            getFilteredRecommendations().map((recommendation) => (
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
            <div className="py-8 text-center">
              <p>{t("recommendations.no_matches")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
