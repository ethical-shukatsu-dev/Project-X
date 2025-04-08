"use client";

import { useScrollDirection } from "@/hooks";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";
import { Link } from "@/components/ui/link";

export default function Header() {
  const { scrollDirection } = useScrollDirection(3);
  
  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 border-b backdrop-blur-sm bg-background/80 border-border ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between p-4">
          <Link 
            href="/questionnaire" 
            className="text-xl font-bold transition-colors duration-200 hover:text-primary"
          >
            <Image 
              src="/images/logos/base_me.svg" 
              alt="Project X Logo" 
              width={120} 
              height={30} 
              priority
            />
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
} 