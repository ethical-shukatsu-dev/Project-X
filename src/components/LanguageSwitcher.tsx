'use client';

import { useRouter, usePathname } from 'next/navigation';
import { languages } from '../i18n-config';
import { Button } from './ui/button';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  const switchLanguage = (locale: string) => {
    // Get the current path without the locale prefix
    const currentPath = pathname.split('/').slice(2).join('/');
    // Navigate to the new locale path
    router.push(`/${locale}/${currentPath}`);
  };

  // Determine current language from pathname
  const currentLang = pathname.split('/')[1] || 'en';

  return (
    <div className="flex items-center space-x-2">
      {languages.map((locale) => (
        <Button
          key={locale}
          variant={currentLang === locale ? "default" : "outline"}
          size="sm"
          onClick={() => switchLanguage(locale)}
          className="px-3 py-1"
        >
          {locale === 'en' ? 'English' : '日本語'}
        </Button>
      ))}
    </div>
  );
} 