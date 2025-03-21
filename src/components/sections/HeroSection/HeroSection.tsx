import Link from "next/link";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import StarBorder from "@/components/ui/Animations/StarBorder/StarBorder";
import AnonymousModeToggle from "@/components/AnonymousModeToggle";

interface HeroSectionProps {
  title: string;
  description: string;
  selectText: string;
  textQuestionnaireText: string;
  imageQuestionnaireText: string;
  lng: string;
}

export default function HeroSection({
  title,
  description,
  selectText,
  textQuestionnaireText,
  imageQuestionnaireText,
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

          <AnimatedContent direction="vertical" distance={30} delay={900}>
            <div className="px-4 mt-4 space-y-4 sm:space-y-6 sm:mt-6 md:mt-10">
              <p className="text-base font-medium text-gray-200 sm:text-lg">
                {selectText}
              </p>

              <div className="flex flex-col justify-center w-full gap-4 sm:flex-row sm:gap-5 sm:w-auto">
                <Link href={`/${lng}/questionnaire?type=text`}>
                  <StarBorder
                    as="div"
                    color="#3B82F6"
                    className="transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      {textQuestionnaireText}
                    </span>
                  </StarBorder>
                </Link>

                <Link href={`/${lng}/questionnaire?type=image`} className="block">
                  <StarBorder
                    as="div"
                    color="#EC4899"
                    className="transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                      {imageQuestionnaireText}
                    </span>
                  </StarBorder>
                </Link>
              </div>

              <AnimatedContent direction="vertical" distance={20} delay={1200}>
                <div className="flex justify-center pt-3 mt-6">
                  <AnonymousModeToggle lng={lng} />
                </div>
              </AnimatedContent>
            </div>
          </AnimatedContent>
        </div>
      </div>
    </section>
  );
} 