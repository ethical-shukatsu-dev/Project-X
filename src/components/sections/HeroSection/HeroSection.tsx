import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
// import AnonymousModeToggle from "@/components/AnonymousModeToggle";
import QuestionnaireOptions from "@/components/ui/QuestionnaireOptions/QuestionnaireOptions";

interface HeroSectionProps {
  title: string;
  description: string;
  // selectText: string;
  // textQuestionnaireText: string;
  // imageQuestionnaireText: string;
  lng: string;
}

export default function HeroSection({
  title,
  description,
  // selectText,
  // textQuestionnaireText,
  // imageQuestionnaireText,
  lng,
}: HeroSectionProps) {
  return (
    <section className="relative w-full pt-16 pb-24 overflow-hidden sm:pt-20 md:pt-24 sm:pb-28 md:pb-32">
      <div className="container max-w-6xl px-4 mx-auto md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center sm:space-y-6 md:space-y-10">
          <AnimatedContent direction="vertical" distance={40} delay={300}>
            <h1 className="px-2 text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 sm:text-5xl md:text-7xl lg:text-8xl">
              {title}
            </h1>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={30} delay={600}>
            <p className="max-w-[600px] text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed px-4 sm:px-6">
              {description}
            </p>
          </AnimatedContent>

          <QuestionnaireOptions
            lng={lng}
            showAnimation={true}
            animationDelay={900}
          />

          {/* <AnimatedContent direction="vertical" distance={20} delay={1200}>
            <div className="flex justify-center pt-3 mt-6">
              <AnonymousModeToggle lng={lng} />
            </div>
          </AnimatedContent> */}
        </div>
      </div>
    </section>
  );
}
