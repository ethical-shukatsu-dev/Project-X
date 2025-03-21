"use client";

import React, {useState, useEffect} from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {Loader2} from "lucide-react";

interface EventCount {
  event_type: string;
  count: number;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  timestamp: string;
  session_id?: string;
  user_id?: string;
  properties?: Record<string, unknown>;
  created_at: string;
}

interface DailyEventData {
  date: string;
  [key: string]: string | number;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  eventCounts: EventCount[];
  stats: {
    totalEvents: number;
    signupClicks: number;
    dialogCloses: number;
    conversionRate: string;
  };
}

interface TrendData {
  trends: DailyEventData[];
  eventTypes: string[];
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>("7d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch main analytics data
        const response = await fetch(
          `/api/admin/analytics?timeRange=${timeRange}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalyticsData(data);

        // Fetch trend data
        const trendResponse = await fetch(
          `/api/admin/analytics/trends?days=${
            timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : 30
          }`
        );

        if (!trendResponse.ok) {
          throw new Error("Failed to fetch trend data");
        }

        const trendData = await trendResponse.json();
        setTrendData(trendData);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Format event type for display
  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container flex flex-col justify-center p-8">
      <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>

      {/* Time range selector */}
      <div className="mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2">Loading analytics data...</span>
        </div>
      ) : error ? (
        <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Event List</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-4 mb-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats.totalEvents}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Signup Clicks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats.signupClicks}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dialog Closes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats.dialogCloses}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData?.stats.conversionRate}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Event Types</CardTitle>
                <CardDescription>
                  Distribution of events by type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData?.eventCounts.map((event) => {
                      const percentage =
                        analyticsData.stats.totalEvents > 0
                          ? (
                              (event.count / analyticsData.stats.totalEvents) *
                              100
                            ).toFixed(1)
                          : "0";

                      return (
                        <TableRow key={event.event_type}>
                          <TableCell className="font-medium">
                            {formatEventType(event.event_type)}
                          </TableCell>
                          <TableCell className="text-right">
                            {event.count}
                          </TableCell>
                          <TableCell className="text-right">
                            {percentage}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event List</CardTitle>
                <CardDescription>
                  Recent events tracked in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Properties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData?.events.slice(0, 50).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          {formatEventType(event.event_type)}
                        </TableCell>
                        <TableCell>{formatDate(event.timestamp)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.session_id?.substring(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <pre className="max-w-xs overflow-hidden text-xs truncate">
                            {JSON.stringify(event.properties)}
                          </pre>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Daily Trends</CardTitle>
                <CardDescription>Event counts over time</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 
                  In a real application, you would implement a chart here.
                  For simplicity, we're just showing the raw data in a table.
                  You could use libraries like recharts, chart.js, or d3 to visualize this data.
                */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      {trendData?.eventTypes.map((type) => (
                        <TableHead key={type} className="text-right">
                          {formatEventType(type)}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trendData?.trends.map((day) => (
                      <TableRow key={day.date}>
                        <TableCell>
                          {new Date(day.date).toLocaleDateString()}
                        </TableCell>
                        {trendData.eventTypes.map((type) => (
                          <TableCell key={type} className="text-right">
                            {day[type] as number}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
