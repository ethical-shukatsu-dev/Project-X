import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RecommendationsContent from "@/components/recommendations/RecommendationsContent";
import { getTranslation } from "@/i18n-server";

// Loading fallback component
async function RecommendationsLoading({ lng }: { lng: string }) {
  const { t } = await getTranslation(lng, 'ai');
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">{t('recommendations.loading.title')}</h1>
      <p className="text-lg mb-8">{t('recommendations.loading.description')}</p>
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default async function RecommendationsPage({
  params: { lng }
}: {
  params: { lng: string }
}) {
  return (
    <Suspense fallback={<RecommendationsLoading lng={lng} />}>
      <RecommendationsContent lng={lng} />
    </Suspense>
  );
} 