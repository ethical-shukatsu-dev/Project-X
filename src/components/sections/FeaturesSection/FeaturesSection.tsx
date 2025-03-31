import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import FeatureCard from "@/components/ui/FeatureCard/FeatureCard";
import QuestionnaireOptions from "@/components/ui/QuestionnaireOptions/QuestionnaireOptions";

interface FeaturesSectionProps {
  title: string;
  features: {
    title: string;
    description: string;
    color: "blue" | "purple" | "pink";
  }[];
  showQuestionnaireOptions?: boolean;
  lng?: string;
}

export default function FeaturesSection({
  title,
  features,
  showQuestionnaireOptions = false,
  lng = "",
}: FeaturesSectionProps) {
  const icons = {
    blue: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        ></path>
      </svg>
    ),
    purple: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        ></path>
      </svg>
    ),
    pink: (
      <svg
        className="w-7 h-7"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        ></path>
      </svg>
    ),
  };

  return (
    <section className="relative z-10 w-full pb-16 overflow-hidden sm:pb-20 md:pb-24 lg:pb-32">
      <div className="container max-w-6xl px-4 mx-auto md:px-6">
        <AnimatedContent direction="vertical" distance={40} delay={300}>
          <h2 className="px-2 mb-12 text-2xl font-bold text-center text-transparent sm:text-3xl md:text-4xl sm:mb-16 bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {title}
          </h2>
        </AnimatedContent>

        <div className="grid gap-6 px-2 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 sm:px-0">
          {features.map((feature) => (
            <AnimatedContent
              key={feature.title}
              direction="vertical"
              distance={40}
              delay={200}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={icons[feature.color]}
                color={feature.color}
              />
            </AnimatedContent>
          ))}
        </div>

        {showQuestionnaireOptions && lng && (
          <div className="flex items-center justify-center mt-16 text-center">
            <QuestionnaireOptions
              lng={lng}
              showAnimation={true}
              animationDelay={100}
            />
          </div>
        )}
      </div>
    </section>
  );
}
