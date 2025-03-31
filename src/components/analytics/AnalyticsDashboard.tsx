"use client";

import {MetricCard, ConversionFunnel, SplitMetric} from "./DashboardCards";
import {useAnalytics, TimeRange} from "@/hooks/useAnalytics";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";

const timeRangeLabels: Record<TimeRange, string> = {
  "24h": "Last 24 Hours",
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  all: "All Time",
};

export function AnalyticsDashboard() {
  const {data, loading, error, timeRange, changeTimeRange} = useAnalytics();

  if (error) {
    return (
      <Card className="border-red-300">
        <CardHeader>
          <CardTitle className="text-red-500">
            Error Loading Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (loading || !data) {
    return <DashboardSkeleton />;
  }

  const {stats} = data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

        <div className="flex">
          <Tabs defaultValue="all">
            <TabsList>
              {(Object.keys(timeRangeLabels) as TimeRange[]).map((range) => (
                <TabsTrigger
                  key={range}
                  value={range}
                  onClick={() => changeTimeRange(range)}
                  data-state={timeRange === range ? "active" : ""}
                >
                  {timeRangeLabels[range]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visitors"
          value={stats.surveyFunnel.visits.toLocaleString()}
          description="Users who visited home page"
        />
        <MetricCard
          title="Survey Started"
          value={stats.surveyFunnel.started.toLocaleString()}
          description={`${stats.surveyFunnel.startRate} of visitors`}
        />
        <MetricCard
          title="Survey Completed"
          value={stats.surveyFunnel.completed.toLocaleString()}
          description={`${stats.surveyFunnel.completionRate} completion rate`}
        />
        <MetricCard
          title="Total Signups"
          value={stats.signups.totalSignups.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConversionFunnel
          title="Survey Funnel"
          steps={[
            {name: "Visitors", value: stats.surveyFunnel.visits},
            {name: "Started Survey", value: stats.surveyFunnel.started},
            {name: "Completed Survey", value: stats.surveyFunnel.completed},
          ]}
          rates={[
            {name: "Start Rate", value: stats.surveyFunnel.startRate},
            {name: "Completion Rate", value: stats.surveyFunnel.completionRate},
            {
              name: "Overall Conversion",
              value: stats.surveyFunnel.overallConversionRate,
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Survey Types</CardTitle>
            <CardDescription>
              Distribution of survey types selected by users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold">
                    {stats.surveyTypes.text}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Text-based
                  </div>
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {stats.surveyTypes.image}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Image-based
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">Distribution</div>
                <div className="relative h-2 bg-muted rounded-full">
                  {stats.surveyTypes.total > 0 && (
                    <div
                      className="absolute h-full bg-primary rounded-l-full"
                      style={{
                        width: `${
                          (stats.surveyTypes.text / stats.surveyTypes.total) *
                          100
                        }%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div>
                    Text:{" "}
                    {stats.surveyTypes.total > 0
                      ? `${Math.round(
                          (stats.surveyTypes.text / stats.surveyTypes.total) *
                            100
                        )}%`
                      : "0%"}
                  </div>
                  <div>
                    Image:{" "}
                    {stats.surveyTypes.total > 0
                      ? `${Math.round(
                          (stats.surveyTypes.image / stats.surveyTypes.total) *
                            100
                        )}%`
                      : "0%"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SplitMetric
          title="Signup Methods"
          metrics={[
            {
              name: "Email Signups",
              value: stats.signups.emailSignups.toLocaleString(),
            },
            {
              name: "Google Signups",
              value: stats.signups.googleSignups.toLocaleString(),
            },
          ]}
          total={stats.signups.totalSignups.toLocaleString()}
        />

        <SplitMetric
          title="Recommendations Engagement"
          metrics={[
            {
              name: "Page Visits",
              value: stats.recommendations.pageVisits.toLocaleString(),
            },
            {
              name: "Company Interest Clicks",
              value:
                stats.recommendations.companyInterestClicks.toLocaleString(),
            },
            {
              name: "Interest Rate",
              value: stats.recommendations.companyInterestRate,
            },
            {
              name: "Avg Companies per User",
              value:
                stats.recommendations.averageCompaniesPerUser.toLocaleString(),
            },
          ]}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-96" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-40" />
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-6 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ))}
              </div>
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-3 gap-4">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="text-center">
                      <Skeleton className="h-6 w-16 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
