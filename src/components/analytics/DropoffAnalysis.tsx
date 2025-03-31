"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RefreshButton } from "./DashboardCards";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface StepDropoffData {
  id: string;
  label: string;
  completed: number;
  abandoned: number;
  completionRate: string;
  abandonmentRate: string;
  avgTimeSpentSeconds: number;
}

interface DropoffAnalysisProps {
  title: string;
  description?: string;
  data: StepDropoffData[];
  onRefresh?: () => void;
}

export function DropoffAnalysis({ title, description, data, onRefresh }: DropoffAnalysisProps) {
  // Prepare chart data
  const completionChart = data.map(step => ({
    step: step.label,
    Completed: step.completed,
    Abandoned: step.abandoned,
  }));

  const timeSpentChart = data.map(step => ({
    step: step.label,
    'Avg Time (seconds)': step.avgTimeSpentSeconds,
  }));

  // Calculate drop-off between steps
  const dropOffData = data.map((step, index) => {
    const previousCompleted = index > 0 ? data[index - 1].completed : step.completed + step.abandoned;
    const dropOff = previousCompleted - step.completed;
    const dropOffRate = previousCompleted > 0 
      ? Math.round((dropOff / previousCompleted) * 100) 
      : 0;
    
    return {
      step: step.label,
      'Drop-offs': dropOff,
      'Drop-off Rate': `${dropOffRate}%`,
    };
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {onRefresh && <RefreshButton onClick={onRefresh} size="md" />}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="completion">
          <TabsList className="mb-4">
            <TabsTrigger value="completion">Completion vs Abandonment</TabsTrigger>
            <TabsTrigger value="dropoff">Step Drop-offs</TabsTrigger>
            <TabsTrigger value="timespent">Time Spent</TabsTrigger>
          </TabsList>

          <TabsContent value="completion" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={completionChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="step" type="category" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} users`, name]}
                    labelFormatter={(value: string) => `Step: ${value}`}
                  />
                  <Legend />
                  <Bar dataKey="Completed" fill="#22c55e" />
                  <Bar dataKey="Abandoned" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.map((step, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium">
                      {step.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-muted-foreground">Completed:</div>
                      <div className="font-medium text-right">{step.completed}</div>
                      
                      <div className="text-muted-foreground">Abandoned:</div>
                      <div className="font-medium text-right">{step.abandoned}</div>
                      
                      <div className="text-muted-foreground">Completion:</div>
                      <div className="font-medium text-right text-green-500">{step.completionRate}</div>
                      
                      <div className="text-muted-foreground">Abandonment:</div>
                      <div className="font-medium text-right text-red-500">{step.abandonmentRate}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dropoff" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dropOffData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number | string, name: string) => [value, name]}
                    labelFormatter={(value: string) => `Step: ${value}`}
                  />
                  <Bar dataKey="Drop-offs" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {dropOffData.map((item, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium">
                      {item.step}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-muted-foreground">Drop-offs:</div>
                      <div className="font-medium text-right">{item['Drop-offs']}</div>
                      
                      <div className="text-muted-foreground">Drop-off Rate:</div>
                      <div className="font-medium text-right text-orange-500">{item['Drop-off Rate']}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="timespent" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSpentChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value} seconds`, name]}
                    labelFormatter={(value: string) => `Step: ${value}`}
                  />
                  <Bar dataKey="Avg Time (seconds)" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.map((step, index) => (
                <Card key={index} className="bg-muted/50">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium">
                      {step.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="grid grid-cols-2 gap-1 text-sm">
                      <div className="text-muted-foreground">Avg Time:</div>
                      <div className="font-medium text-right">
                        {step.avgTimeSpentSeconds.toFixed(1)} seconds
                      </div>
                      
                      <div className="text-muted-foreground">Completion:</div>
                      <div className="font-medium text-right">{step.completionRate}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 