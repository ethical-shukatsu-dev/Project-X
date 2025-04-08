import {redirect} from "next/navigation";
export default function Home({params}: {params: Promise<{lng: string}>}) {
  // Use an async IIFE to handle the Promise
  const HomeContent = async () => {
    const resolvedParams = await params;
    const lng = resolvedParams.lng;
    redirect(`/${lng}/questionnaire`);
  };

  return HomeContent();
}
