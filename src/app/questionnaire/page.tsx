import { redirect } from 'next/navigation';
import { fallbackLng } from '@/i18n-config';

export default function QuestionnairePage() {
  // Redirect to the default locale
  redirect(`/${fallbackLng}/questionnaire`);
}
