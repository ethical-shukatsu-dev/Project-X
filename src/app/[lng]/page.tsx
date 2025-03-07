import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslation } from "@/i18n-server";

export default function Home({
  params
}: {
  params: Promise<{ lng: string }>
}) {
  // Use an async IIFE to handle the Promise
  const HomeContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;
    const { t } = await getTranslation(lng, 'common');

    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="px-4 md:px-6">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    {t('homepage.title')}
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    {t('homepage.description')}
                  </p>
                </div>
                <div className="space-x-4">
                  <Link href={`/${lng}/questionnaire`}>
                    <Button size="lg">{t('homepage.getStarted')}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
                <Card className="border-none shadow-sm">
                  <CardHeader className="text-center">
                    <CardTitle>{t('features.quick.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('features.quick.description')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="text-center">
                    <CardTitle>{t('features.values.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('features.values.description')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="text-center">
                    <CardTitle>{t('features.insights.title')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('features.insights.description')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </main>
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('footer.copyright')}
          </p>
        </footer>
      </div>
    );
  };

  return HomeContent();
} 