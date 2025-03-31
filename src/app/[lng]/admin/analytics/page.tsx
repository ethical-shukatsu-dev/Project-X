import {AnalyticsDashboard} from "@/components/analytics/AnalyticsDashboard";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  description: "View website analytics and metrics",
};

export default function AnalyticsPage() {
  return (
    <div className="container justify-center items-center max-w-4xl mx-auto p-8 space-y-6">
      <AnalyticsDashboard />
    </div>
  );
}
