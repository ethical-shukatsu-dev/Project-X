"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshButton } from "./DashboardCards";

interface SurveyStep {
  id: string;
  count: number;
  label: string;
  percentage?: string;
}

interface SurveyStepsFunnelProps {
  title: string;
  steps: SurveyStep[];
  totalStarts: number;
  onRefresh?: () => void;
}

export function SurveyStepsFunnel({ title, steps, totalStarts, onRefresh }: SurveyStepsFunnelProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && <RefreshButton onClick={onRefresh} size="md" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {steps.map((step, index) => {
            // Calculate percentage if not provided
            const displayPercentage = step.percentage || 
              (totalStarts > 0 ? `${Math.round((step.count / totalStarts) * 100)}%` : '0%');
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{step.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{step.count}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{displayPercentage}</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-primary rounded-full" 
                    style={{ width: displayPercentage }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 