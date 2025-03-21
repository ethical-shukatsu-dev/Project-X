/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useTranslation} from "@/i18n-client";
import {RecommendationResult} from "@/lib/openai/client";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";

interface RecommendationTabsProps {
  lng: string;
  recommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeSizeTab: string;
  setActiveSizeTab: (value: string) => void;
  startupRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  smallRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  mediumRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  largeRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  interestedRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  notInterestedRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
  pendingRecommendations: (RecommendationResult & {
    feedback?: "interested" | "not_interested";
  })[];
}

export default function RecommendationTabs({
  lng,
  recommendations,
  activeTab,
  setActiveTab,
  activeSizeTab,
  setActiveSizeTab,
  startupRecommendations,
  smallRecommendations,
  mediumRecommendations,
  largeRecommendations,
  interestedRecommendations,
  notInterestedRecommendations,
  pendingRecommendations,
}: RecommendationTabsProps) {
  const {t} = useTranslation(lng, "ai");

  return (
    <>
      {/* Feedback Status Tabs */}
      {/* <AnimatedContent direction="vertical" distance={20} delay={750}>
        <Tabs
          defaultValue="all"
          className="w-full mb-3 sm:mb-6"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="flex flex-wrap h-full gap-1 p-1 sm:gap-2 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10">
            <TabsTrigger
              value="all"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.tabs.all")} ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.tabs.pending")} ({pendingRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="interested"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.tabs.interested")} (
              {interestedRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="not-interested"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.tabs.not_interested")} (
              {notInterestedRecommendations.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AnimatedContent> */}

      {/* Company Size Tabs */}
      <AnimatedContent direction="vertical" distance={20} delay={900}>
        <Tabs
          defaultValue="all-sizes"
          className="w-full mb-3 sm:mb-6"
          value={activeSizeTab}
          onValueChange={setActiveSizeTab}
        >
          <TabsList className="flex flex-wrap h-full gap-1 p-1 sm:gap-2 bg-gradient-to-b from-white/10 to-white/[0.02] backdrop-blur-sm border border-white/10">
            <TabsTrigger
              value="all-sizes"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.size_tabs.all")} ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="startup"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.size_tabs.startup")} (
              {startupRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="small"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.size_tabs.small")} ({smallRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="medium"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.size_tabs.medium")} (
              {mediumRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="large"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t("recommendations.size_tabs.large")} ({largeRecommendations.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AnimatedContent>
    </>
  );
} 