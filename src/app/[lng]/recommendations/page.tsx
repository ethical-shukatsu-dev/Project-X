import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RecommendationsContent from "@/components/recommendations/RecommendationsContent";
import { getTranslation } from "@/i18n-server";
import Aurora from "@/components/ui/Backgrounds/Aurora/Aurora";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import FloatingElement from "@/components/ui/FloatingElement";

// Loading fallback component
async function RecommendationsLoading({ lng }: { lng: string }) {
  const { t } = await getTranslation(lng, 'ai');
  
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
        {t('recommendations.loading.title')}
      </h1>
      <p className="text-lg mb-8 text-gray-300">{t('recommendations.loading.description')}</p>
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full mb-4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function RecommendationsPage({
  params
}: {
  params: Promise<{ lng: string }>
}) {
  // Use an async IIFE to handle the Promise
  const RecommendationsPageContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;
    
    return (
      <div className="flex flex-col min-h-screen overflow-hidden bg-black text-white relative">
        {/* Background Aurora Effect */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Aurora
            colorStops={["#3B82F6", "#8B5CF6", "#EC4899"]}
            amplitude={1.5}
            blend={0.6}
          />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Grain overlay using CSS pattern */}
        <div
          className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        ></div>

        {/* Decorative floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
          <FloatingElement
            className="absolute top-[15%] left-[8%]"
            baseSpeed={9}
            intensity={15}
          >
            <div className="w-14 h-14 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
          </FloatingElement>

          <FloatingElement
            className="absolute top-[40%] right-[12%]"
            baseSpeed={7}
            intensity={1.5}
          >
            <div className="w-16 h-16 rounded-full bg-purple-500 opacity-20 blur-xl"></div>
          </FloatingElement>

          <FloatingElement
            className="absolute bottom-[30%] left-[20%]"
            baseSpeed={6}
            intensity={1.2}
          >
            <div className="w-20 h-20 rounded-full bg-pink-500 opacity-20 blur-xl"></div>
          </FloatingElement>
        </div>
        
        <main className="flex-1 relative z-20">
          <Suspense fallback={<RecommendationsLoading lng={lng} />}>
            <AnimatedContent direction="vertical" distance={40} delay={300}>
              <RecommendationsContent lng={lng} />
            </AnimatedContent>
          </Suspense>
        </main>
        
        {/* Decorative elements */}
        <div className="absolute -left-20 bottom-1/3 w-40 h-40 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
        <div className="absolute -right-20 bottom-2/3 w-60 h-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
      </div>
    );
  };

  return RecommendationsPageContent();
} 