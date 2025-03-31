import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard',
  description: 'View website analytics and metrics'
};

export default function AnalyticsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <AnalyticsDashboard />
    </div>
  );
}
