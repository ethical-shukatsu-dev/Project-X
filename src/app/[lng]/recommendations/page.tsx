import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import RecommendationsContent from "@/components/recommendations/RecommendationsContent";
import {getTranslation} from "@/i18n-server";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import BackgroundEffects from "@/components/ui/BackgroundEffects/BackgroundEffects";
import FloatingDecorations from "@/components/ui/FloatingDecorations/FloatingDecorations";

// Loading fallback component
async function RecommendationsLoading({lng}: {lng: string}) {
  const {t} = await getTranslation(lng, "ai");

  return (
    <div className="container px-4 py-8 mx-auto text-center">
      <h1 className="mb-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
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
  );
}

// Main page component with Suspense boundary
export default function RecommendationsPage({
  params,
}: {
  params: Promise<{lng: string}>;
}) {
  // Use an async IIFE to handle the Promise
  const RecommendationsPageContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;

    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden text-white bg-black">
        <BackgroundEffects />
        <FloatingDecorations />

        <main className="relative z-20 flex-1">
          <Suspense fallback={<RecommendationsLoading lng={lng} />}>
            <AnimatedContent direction="vertical" distance={40} delay={300}>
              <RecommendationsContent lng={lng} />
            </AnimatedContent>
          </Suspense>
        </main>

        {/* Decorative elements */}
        <div className="absolute w-40 h-40 bg-blue-500 rounded-full -left-20 bottom-1/3 opacity-20 blur-3xl"></div>
        <div className="absolute bg-purple-500 rounded-full -right-20 bottom-2/3 w-60 h-60 opacity-20 blur-3xl"></div>
      </div>
    );
  };

  return RecommendationsPageContent();
}
