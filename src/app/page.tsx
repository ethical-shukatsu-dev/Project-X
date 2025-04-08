import { redirect } from 'next/navigation';
import { fallbackLng } from '@/i18n-config';

export default function Home() {
  // Redirect to the questionnaire page with default locale
  redirect(`/${fallbackLng}/questionnaire`);
}
