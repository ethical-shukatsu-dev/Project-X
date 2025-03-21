import { redirect } from 'next/navigation';
import { fallbackLng } from '@/i18n-config';

export default function AdminAnalyticsPage() {
  // Redirect to the default locale
  redirect(`/${fallbackLng}/admin/analytics`);
}
