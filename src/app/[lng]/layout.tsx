import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "../globals.css";
import {dir} from "i18next";
import {languages} from "../../i18n-config";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {ReactNode} from "react";
import Link from "next/link";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Project X - Find Your Perfect Company Match",
  description:
    "Discover companies that align with your values and interests. Take a quick questionnaire and get personalized recommendations.",
};

export async function generateStaticParams() {
  return languages.map((lng) => ({lng}));
}

// Define the component with the expected structure
export default function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{lng: string}>;
}) {
  // Use an async IIFE to handle the Promise
  const RootLayoutContent = async () => {
    const resolvedParams = await params;

    return (
      <html
        lang={resolvedParams.lng}
        dir={dir(resolvedParams.lng)}
        className={inter.className}
      >
        <body>
          <header className="flex items-center justify-between p-4 border-b">
            <Link href="/" className="text-xl font-bold">
              Project X
            </Link>
            <LanguageSwitcher />
          </header>
          {children}
        </body>
      </html>
    );
  };

  return RootLayoutContent();
}
