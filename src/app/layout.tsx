import type { Metadata } from 'next';
import { languages } from '@/i18n-config';

export const metadata: Metadata = {
  title: 'Project X - Find Your Perfect Company Match',
  description:
    'Discover companies that align with your values and interests. Take a quick questionnaire and get personalized recommendations.',
};

export async function generateStaticParams() {
  return languages.map((lng: string) => ({ lng }));
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
