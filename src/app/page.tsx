import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Find Your Perfect Company Match
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Discover companies that align with your values and interests. Take a quick questionnaire and get personalized recommendations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/questionnaire">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Quick & Easy</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Complete a short questionnaire in under 3 minutes to get started.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Values-Based Matching</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our AI analyzes your values and interests to find companies that align with what matters to you.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Personalized Insights</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    See exactly why each company is a good match for you with detailed matching points.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2023 Project X. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
