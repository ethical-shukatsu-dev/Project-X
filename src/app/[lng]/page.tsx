import Link from "next/link";
import {getTranslation} from "@/i18n-server";
import AnonymousModeToggle from "@/components/AnonymousModeToggle";
import AnimatedContent from "@/components/ui/Animations/AnimatedContent/AnimatedContent";
import Aurora from "@/components/ui/Backgrounds/Aurora/Aurora";
import StarBorder from "@/components/ui/Animations/StarBorder/StarBorder";
import FloatingElement from "@/components/ui/FloatingElement";

export default function Home({params}: {params: Promise<{lng: string}>}) {
  // Use an async IIFE to handle the Promise
  const HomeContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;
    const {t} = await getTranslation(lng, "common");

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

          <FloatingElement
            className="absolute top-[60%] right-[15%]"
            baseSpeed={7}
            intensity={0.9}
          >
            <div className="w-14 h-14 rounded-full bg-blue-500 opacity-20 blur-xl"></div>
          </FloatingElement>
        </div>

        <main className="flex-1 relative z-20">
          <section className="w-full pt-24 pb-32 relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <div className="flex flex-col items-center space-y-6 md:space-y-10 text-center">
                <AnimatedContent direction="vertical" distance={40} delay={300}>
                  <h1 className="font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-5xl md:text-7xl lg:text-8xl">
                    {t("homepage.title")}
                  </h1>
                </AnimatedContent>

                <AnimatedContent direction="vertical" distance={30} delay={600}>
                  <p className="max-w-[600px] text-gray-300 text-lg md:text-xl leading-relaxed">
                    {t("homepage.description")}
                  </p>
                </AnimatedContent>

                <AnimatedContent direction="vertical" distance={30} delay={900}>
                  <div className="space-y-6 mt-6 md:mt-10">
                    <p className="text-lg font-medium text-gray-200">
                      {t("homepage.selectQuestionnaireType")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                      <Link
                        href={`/${lng}/questionnaire?type=text`}
                        className="block"
                      >
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
                            {t("homepage.textQuestionnaire")}
                          </span>
                        </StarBorder>
                      </Link>

                      <Link
                        href={`/${lng}/questionnaire?type=image`}
                        className="block"
                      >
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

                            {t("homepage.imageQuestionnaire")}
                          </span>
                        </StarBorder>
                      </Link>
                    </div>

                    <AnimatedContent
                      direction="vertical"
                      distance={20}
                      delay={1200}
                    >
                      <div className="flex justify-center mt-6 pt-3">
                        <AnonymousModeToggle lng={lng} />
                      </div>
                    </AnimatedContent>
                  </div>
                </AnimatedContent>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -left-20 top-1/3 w-40 h-40 rounded-full bg-blue-500 opacity-20 blur-3xl"></div>
            <div className="absolute -right-20 top-2/3 w-60 h-60 rounded-full bg-purple-500 opacity-20 blur-3xl"></div>
          </section>

          <section className="relative z-10 w-full py-24 md:py-32 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-6xl">
              <AnimatedContent direction="vertical" distance={40} delay={300}>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  {t("features.quick.title") || "Why Choose Us"}
                </h2>
              </AnimatedContent>

              <div className="grid gap-8 md:grid-cols-3">
                <AnimatedContent direction="vertical" distance={40} delay={400}>
                  <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 group transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-500/50 duration-300">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-6 group-hover:bg-blue-500/20 transition-all duration-300">
                      <svg
                        className="w-7 h-7 text-blue-400"
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
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-blue-400 transition-colors">
                      {t("features.quick.title")}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {t("features.quick.description")}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  </div>
                </AnimatedContent>

                <AnimatedContent direction="vertical" distance={40} delay={600}>
                  <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 group transition-all hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 duration-300">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-500/10 mb-6 group-hover:bg-purple-500/20 transition-all duration-300">
                      <svg
                        className="w-7 h-7 text-purple-400"
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
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-400 transition-colors">
                      {t("features.values.title")}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {t("features.values.description")}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  </div>
                </AnimatedContent>

                <AnimatedContent direction="vertical" distance={40} delay={800}>
                  <div className="relative p-6 md:p-8 rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 group transition-all hover:shadow-xl hover:shadow-pink-500/10 hover:border-pink-500/50 duration-300">
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-pink-500/10 mb-6 group-hover:bg-pink-500/20 transition-all duration-300">
                      <svg
                        className="w-7 h-7 text-pink-400"
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
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-pink-400 transition-colors">
                      {t("features.insights.title")}
                    </h3>
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {t("features.insights.description")}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                  </div>
                </AnimatedContent>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute left-1/4 bottom-0 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl -z-10"></div>
          </section>
        </main>

        <footer className="relative z-20 py-8 w-full border-t border-white/10">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">{t("footer.copyright")}</p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287a4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return HomeContent();
}
