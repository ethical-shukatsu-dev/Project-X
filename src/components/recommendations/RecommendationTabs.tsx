/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/i18n-client';
import { RecommendationResult } from '@/lib/recommendations/client';
import AnimatedContent from '@/components/ui/Animations/AnimatedContent/AnimatedContent';
import { useMemo } from 'react';

interface RecommendationTabsProps {
  lng: string;
  recommendations: (RecommendationResult & {
    feedback?: 'interested' | 'not_interested';
  })[];
  activeTab: string;
  setActiveTab: (value: string) => void;
  activeSizeTab: string;
  setActiveSizeTab: (value: string) => void;
}

export default function RecommendationTabs({
  lng,
  recommendations,
  activeTab,
  setActiveTab,
  activeSizeTab,
  setActiveSizeTab,
}: RecommendationTabsProps) {
  const { t } = useTranslation(lng, 'ai');

  // Memoized filtered recommendations
  const {
    interestedRecommendations,
    notInterestedRecommendations,
    pendingRecommendations,
    startupRecommendations,
    smallRecommendations,
    mediumRecommendations,
    largeRecommendations,
  } = useMemo(() => {
    // Filter by feedback status
    const interested = recommendations.filter((rec) => rec.feedback === 'interested');
    const notInterested = recommendations.filter((rec) => rec.feedback === 'not_interested');
    const pending = recommendations.filter((rec) => !rec.feedback);

    // Helper function to determine company size category
    const getSizeCategory = (sizeText: string, industry?: string): string => {
      const normalizedSize = sizeText.toLowerCase();
      const normalizedIndustry = industry?.toLowerCase() || '';

      if (
        normalizedSize.includes('startup') ||
        normalizedSize.includes('スタートアップ') ||
        normalizedIndustry.includes('startup') ||
        normalizedIndustry.includes('スタートアップ')
      ) {
        return 'startup';
      }
      if (normalizedSize.includes('small') || normalizedSize.includes('小')) {
        return 'small';
      }
      if (normalizedSize.includes('medium') || normalizedSize.includes('中')) {
        return 'medium';
      }
      if (normalizedSize.includes('large') || normalizedSize.includes('大')) {
        return 'large';
      }
      return 'unknown';
    };

    // Filter by company size
    const startup = recommendations.filter(
      (rec) => getSizeCategory(rec.company.size, rec.company.industry) === 'startup'
    );
    const small = recommendations.filter(
      (rec) => getSizeCategory(rec.company.size, rec.company.industry) === 'small'
    );
    const medium = recommendations.filter(
      (rec) => getSizeCategory(rec.company.size, rec.company.industry) === 'medium'
    );
    const large = recommendations.filter(
      (rec) => getSizeCategory(rec.company.size, rec.company.industry) === 'large'
    );

    return {
      interestedRecommendations: interested,
      notInterestedRecommendations: notInterested,
      pendingRecommendations: pending,
      startupRecommendations: startup,
      smallRecommendations: small,
      mediumRecommendations: medium,
      largeRecommendations: large,
    };
  }, [recommendations]);

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
      <AnimatedContent direction="vertical" distance={20} delay={600}>
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
              {t('recommendations.size_tabs.all')} ({recommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="startup"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t('recommendations.size_tabs.startup')} ({startupRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="small"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t('recommendations.size_tabs.small')} ({smallRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="medium"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t('recommendations.size_tabs.medium')} ({mediumRecommendations.length})
            </TabsTrigger>
            <TabsTrigger
              value="large"
              className="text-xs sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              {t('recommendations.size_tabs.large')} ({largeRecommendations.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AnimatedContent>
    </>
  );
}
