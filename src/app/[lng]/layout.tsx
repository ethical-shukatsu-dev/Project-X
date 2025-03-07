import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { dir } from 'i18next';
import { languages } from '../../i18n-config';
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project X - Find Your Perfect Company Match",
  description: "Discover companies that align with your values and interests. Take a quick questionnaire and get personalized recommendations.",
};

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export default function RootLayout({
  children,
  params: { lng }
}: {
  children: React.ReactNode;
  params: { lng: string };
}) {
  return (
    <html lang={lng} dir={dir(lng)} className={inter.className}>
      <body>
        <header className="flex items-center justify-between p-4 border-b">
          <div className="text-xl font-bold">Project X</div>
          <LanguageSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
} 