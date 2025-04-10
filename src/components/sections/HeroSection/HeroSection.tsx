import AnimatedContent from '@/components/ui/Animations/AnimatedContent/AnimatedContent';
// import AnonymousModeToggle from "@/components/AnonymousModeToggle";
import QuestionnaireOptions from '@/components/ui/QuestionnaireOptions/QuestionnaireOptions';
import CompanyLogos from '@/components/ui/CompanyLogos/CompanyLogos';
import PhoneMockup from '@/components/ui/PhoneMockup/PhoneMockup';
import AnonymousModeToggle from '@/components/AnonymousModeToggle';

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
    <section className="relative w-full pt-16 pb-18 overflow-hidden  sm:pb-28 md:pb-32">
      <div className="container max-w-6xl px-4 mx-auto md:px-6">
        {/* Desktop layout: side by side */}
        <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:gap-8 lg:gap-12">
          {/* Left side content */}
          <div className="flex flex-col md:items-start space-y-6 md:text-left sm:space-y-8 md:flex-1">
            <AnimatedContent direction="vertical" distance={40} delay={300}>
              <h1 className="md:px-0 text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 sm:text-5xl md:text-6xl lg:text-7xl">
                {title}
              </h1>
            </AnimatedContent>

            <AnimatedContent direction="vertical" distance={30} delay={600}>
              <p className="max-w-[600px] text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed md:px-0">
                {description}
              </p>
            </AnimatedContent>

            <AnimatedContent direction="vertical" distance={20} delay={900}>
              <CompanyLogos className="md:mt-2" />
            </AnimatedContent>

            <AnimatedContent direction="vertical" distance={10} delay={1200}>
              <QuestionnaireOptions lng={lng} />
            </AnimatedContent>

            <AnimatedContent direction="vertical" distance={20} delay={1200}>
              <div className="flex justify-center pt-3 mt-6 hidden">
                <AnonymousModeToggle lng={lng} />
              </div>
            </AnimatedContent>
          </div>

          {/* Right side iPhone mockup */}
          <div className="md:flex-1">
            <AnimatedContent direction="horizontal" distance={40} delay={600}>
              <PhoneMockup imageSrc="/images/mockups/iphone_mockup_2.png" />
            </AnimatedContent>
          </div>
        </div>

        {/* Mobile layout: stacked */}
        <div className="flex flex-col items-center space-y-6 text-center md:hidden">
          <AnimatedContent direction="vertical" distance={40} delay={600}>
            <h1 className="px-2 text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 sm:text-5xl">
              {title}
            </h1>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={30} delay={900}>
            <p className="max-w-[600px] text-gray-300 text-base sm:text-lg leading-relaxed px-4 sm:px-6">
              {description}
            </p>
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={20} delay={1200}>
            <CompanyLogos />
          </AnimatedContent>

          <AnimatedContent direction="vertical" distance={10} delay={1500}>
            <QuestionnaireOptions lng={lng} />
          </AnimatedContent>

          {/* Mobile phone mockup - smaller version */}
          <AnimatedContent direction="vertical" distance={20} delay={2000}>
            <div className="w-full flex justify-center">
              <PhoneMockup
                imageSrc="/images/mockups/iphone_mockup_2.png"
                className="mt-4 h-[400px] w-[200px] max-w-none"
              />
            </div>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
}
