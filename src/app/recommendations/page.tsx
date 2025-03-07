import { redirect } from 'next/navigation';
import { fallbackLng } from '@/i18n-config';

export default function RecommendationsPage() {
  // Redirect to the default locale
  redirect(`/${fallbackLng}/recommendations`);
}
