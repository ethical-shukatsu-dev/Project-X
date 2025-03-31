import {getTranslation} from "@/i18n-server";
import BackgroundEffects from "@/components/ui/BackgroundEffects/BackgroundEffects";
import FloatingDecorations from "@/components/ui/FloatingDecorations/FloatingDecorations";
import HeroSection from "@/components/sections/HeroSection/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection/FeaturesSection";
import Footer from "@/components/ui/Footer/Footer";
import HomePageTracker from "@/components/analytics/HomePageTracker";

export default function Home({params}: {params: Promise<{lng: string}>}) {
  // Use an async IIFE to handle the Promise
  const HomeContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;
    const {t} = await getTranslation(lng, "common");

    const features = [
      {
        title: t("features.quick.title"),
        description: t("features.quick.description"),
        color: "blue" as const,
      },
      {
        title: t("features.values.title"),
        description: t("features.values.description"),
        color: "purple" as const,
      },
      {
        title: t("features.insights.title"),
        description: t("features.insights.description"),
        color: "pink" as const,
      },
    ];

    const heroProps = {
      title: t("homepage.title"),
      description: t("homepage.description"),
      lng: lng,
    };

    const featuresProps = {
      title: t("features.quick.title") || "Why Choose Us",
      features: features,
      showQuestionnaireOptions: true,
      lng: lng,
    };

    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden text-white bg-black">
        <BackgroundEffects />
        <FloatingDecorations />

        <HomePageTracker />

        <main className="relative z-20 flex-1">
          <HeroSection {...heroProps} />

          <FeaturesSection {...featuresProps} />
        </main>

        <Footer copyright={t("footer.copyright")} />
      </div>
    );
  };

  return HomeContent();
}
