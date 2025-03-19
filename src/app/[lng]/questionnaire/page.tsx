import ValuesQuestionnaire from "@/components/forms/ValuesQuestionnaire";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {Suspense} from "react";
import {Skeleton} from "@/components/ui/skeleton";
import {getTranslation} from "@/i18n-server";
import Aurora from "@/components/ui/Backgrounds/Aurora/Aurora";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import FloatingElement from "@/components/ui/FloatingElement";

// Loading skeleton component for the questionnaire
function QuestionnaireLoadingSkeleton() {
  return (
    <div className="container mx-auto z-20 pt-12 pb-20">
      <div className="max-w-2xl mx-auto container mx-auto px-4 py-8">
        <Card className="mb-8 text-center bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mx-auto mb-2 bg-white/10 border border-white/10 backdrop-blur-sm" />
            <Skeleton className="h-4 w-full mx-auto bg-white/10 border border-white/10 backdrop-blur-sm" />
            <Skeleton className="h-4 w-5/6 mx-auto mt-1 bg-white/10 border border-white/10 backdrop-blur-sm" />
          </CardHeader>
        </Card>

        {/* Skeleton for questionnaire form */}
        <Card className="w-full max-w-md mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2 bg-white/10 border border-white/10 backdrop-blur-sm" /> {/* Question X of Y */}
            <Skeleton className="h-5 w-full bg-white/10 border border-white/10 backdrop-blur-sm" /> {/* Question text */}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm" />{" "}
                  {/* Radio button */}
                  <Skeleton className="h-5 w-full max-w-[250px] bg-white/10 border border-white/10 backdrop-blur-sm" />{" "}
                  {/* Option label */}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-24 bg-white/10 border border-white/10 backdrop-blur-sm" /> {/* Previous button */}
            <Skeleton className="h-10 w-20 bg-white/10 border border-white/10 backdrop-blur-sm" /> {/* Next button */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function QuestionnairePage({
  params,
  searchParams,
}: {
  params: Promise<{lng: string}>;
  searchParams: Promise<{type?: string}>;
}) {
  // Use an async IIFE to handle the Promise
  const QuestionnairePageContent = async () => {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const lng = resolvedParams.lng;
    const {t} = await getTranslation(lng, "ai");

    // Get the questionnaire type from the URL query parameters
    const questionnaireType = resolvedSearchParams.type || "text"; // Default to text if not specified

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
            className="absolute top-[10%] left-[5%]"
            baseSpeed={10}
            intensity={20}
          >
            <div className="w-12 h-12 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
          </FloatingElement>

          <FloatingElement
            className="absolute top-[30%] right-[10%]"
            baseSpeed={8}
            intensity={1.2}
          >
            <div className="w-16 h-16 rounded-full bg-purple-500 opacity-20 blur-xl"></div>
          </FloatingElement>

          <FloatingElement
            className="absolute bottom-[20%] left-[15%]"
            baseSpeed={5}
            intensity={1}
          >
            <div className="w-20 h-20 rounded-full bg-pink-500 opacity-20 blur-xl"></div>
          </FloatingElement>
        </div>

        <Suspense fallback={<QuestionnaireLoadingSkeleton />}>
          <main className="flex-1 relative z-20 pt-12 pb-20">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-2xl mx-auto">
                <AnimatedContent direction="vertical" distance={40} delay={300}>
                  <Card className="mb-8 text-center bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                        {t("questionnaire.title")}
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-300">
                        {t("questionnaire.description")}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </AnimatedContent>
                
                <AnimatedContent direction="vertical" distance={30} delay={600}>
                  <ValuesQuestionnaire
                    lng={lng}
                    questionnaireType={questionnaireType}
                  />
                </AnimatedContent>
              </div>
            </div>
          </main>
          
          {/* Decorative elements */}
          <div className="absolute -left-20 bottom-1/3 w-40 h-40 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 bottom-2/3 w-60 h-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
        </Suspense>
      </div>
    );
  };

  return QuestionnairePageContent();
}
