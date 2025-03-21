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
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import BackgroundEffects from "@/components/ui/BackgroundEffects/BackgroundEffects";
import FloatingDecorations from "@/components/ui/FloatingDecorations/FloatingDecorations";

// Loading skeleton component for the questionnaire
function QuestionnaireLoadingSkeleton() {
  return (
    <div className="container z-20 pt-12 pb-20 mx-auto">
      <div className="container max-w-2xl px-4 py-8 mx-auto">
        <Card className="mb-8 text-center bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
          <CardHeader>
            <Skeleton className="w-3/4 h-8 mx-auto mb-2 border bg-white/10 border-white/10 backdrop-blur-sm" />
            <Skeleton className="w-full h-4 mx-auto border bg-white/10 border-white/10 backdrop-blur-sm" />
            <Skeleton className="w-5/6 h-4 mx-auto mt-1 border bg-white/10 border-white/10 backdrop-blur-sm" />
          </CardHeader>
        </Card>

        {/* Skeleton for questionnaire form */}
        <Card className="w-full max-w-md mx-auto bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
          <CardHeader>
            <Skeleton className="w-40 h-6 mb-2 border bg-white/10 border-white/10 backdrop-blur-sm" />{" "}
            {/* Question X of Y */}
            <Skeleton className="w-full h-5 border bg-white/10 border-white/10 backdrop-blur-sm" />{" "}
            {/* Question text */}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4 border rounded-full bg-white/10 border-white/10 backdrop-blur-sm" />{" "}
                  {/* Radio button */}
                  <Skeleton className="h-5 w-full max-w-[250px] bg-white/10 border border-white/10 backdrop-blur-sm" />{" "}
                  {/* Option label */}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Skeleton className="w-24 h-10 border bg-white/10 border-white/10 backdrop-blur-sm" />{" "}
            {/* Previous button */}
            <Skeleton className="w-20 h-10 border bg-white/10 border-white/10 backdrop-blur-sm" />{" "}
            {/* Next button */}
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
      <div className="relative flex flex-col min-h-screen overflow-hidden text-white bg-black">
        <BackgroundEffects />
        <FloatingDecorations />

        <Suspense fallback={<QuestionnaireLoadingSkeleton />}>
          <main className="relative z-20 flex-1 pt-12 pb-20">
            <div className="container px-4 py-8 mx-auto">
              <div className="max-w-2xl mx-auto">
                <AnimatedContent direction="vertical" distance={40} delay={300}>
                  <Card className="mb-8 text-center bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold text-transparent md:text-4xl bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
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
          <div className="absolute w-40 h-40 bg-blue-500 rounded-full -left-20 bottom-1/3 opacity-20 blur-3xl"></div>
          <div className="absolute bg-purple-500 rounded-full -right-20 bottom-2/3 w-60 h-60 opacity-20 blur-3xl"></div>
        </Suspense>
      </div>
    );
  };

  return QuestionnairePageContent();
}
