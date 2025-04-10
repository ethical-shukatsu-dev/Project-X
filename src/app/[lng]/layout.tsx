import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { dir } from 'i18next';
import { languages } from '../../i18n-config';
import { ReactNode, Suspense } from 'react';
import Header from '@/components/Header';
import GoogleAuthHead from '@/components/ui/GoogleAuthHead';
import Head from 'next/head';
import FacebookPixel from '@/components/FacebookPixel';
import ClarityProvider from '@/components/ClarityProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project X - Find Your Perfect Company Match',
  description:
    'Discover companies that align with your values and interests. Take a quick questionnaire and get personalized recommendations.',
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

// Define the component with the expected structure
export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lng: string }>;
}) {
  // Use an async IIFE to handle the Promise
  const RootLayoutContent = async () => {
    const resolvedParams = await params;
    return (
      <Suspense fallback={<div className="w-vh h-dvh bg-black"></div>}>
        <html lang={resolvedParams.lng} dir={dir(resolvedParams.lng)} className={inter.className}>
          <Head>
            <GoogleAuthHead />
          </Head>
          <ClarityProvider>
            <FacebookPixel />
            <body>
              <Header />
              {children}
            </body>
          </ClarityProvider>
        </html>
      </Suspense>
    );
  };

  return RootLayoutContent();
}
