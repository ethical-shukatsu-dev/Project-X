import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

// Create the missing components
const Progress = ({ value, className }: { value: number, className?: string }) => (
  <div className={`w-full bg-muted rounded-full ${className || ''}`}>
    <div 
      className="bg-primary rounded-full h-full" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const Badge = ({ 
  children, 
  variant, 
  className 
}: { 
  children: React.ReactNode, 
  variant?: 'default' | 'destructive',
  className?: string 
}) => (
  <span 
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
      ${variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}
      ${className || ''}
    `}
  >
    {children}
  </span>
);

interface RefreshButtonProps {
  onClick?: () => void;
}

export function RefreshButton({ onClick }: RefreshButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={onClick ? onClick : () => {}}
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  onRefresh?: () => void;
}

export function MetricCard({
  title,
  value,
  description,
  onRefresh,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && <RefreshButton onClick={onRefresh} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold">{value.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ConversionFunnelProps {
  title: string;
  steps: {
    name: string;
    value: number;
    breakdown?: {
      anonymous: number;
      nonAnonymous: number;
    };
  }[];
  rates: {
    name: string;
    value: string;
  }[];
  onRefresh?: () => void;
}

export function ConversionFunnel({
  title,
  steps,
  rates,
  onRefresh,
}: ConversionFunnelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && <RefreshButton onClick={onRefresh} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Steps */}
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold">{step.value}</div>
                <div className="text-xs text-muted-foreground">{step.name}</div>
              </div>
            ))}
          </div>

          {/* Started Breakdown */}
          {steps[1]?.name === "Started" && steps[1]?.breakdown && (
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Started Breakdown</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <div className="text-sm font-medium">{steps[1].breakdown.anonymous}</div>
                  <div className="text-xs text-muted-foreground">Anonymous</div>
                </div>
                <div className="p-2 bg-muted/50 rounded-lg text-center">
                  <div className="text-sm font-medium">{steps[1].breakdown.nonAnonymous}</div>
                  <div className="text-xs text-muted-foreground">Non-Anonymous</div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="h-2 bg-muted rounded-full">
            <div
              className="h-2 bg-primary rounded-full"
              style={{
                width: rates[rates.length - 1]?.value || "0%",
              }}
            />
          </div>

          {/* Rates */}
          <div className="grid grid-cols-3 gap-4">
            {rates.map((rate, i) => (
              <div key={i} className="text-center">
                <div className="text-sm font-medium">{rate.value}</div>
                <div className="text-xs text-muted-foreground">{rate.name}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SplitMetricProps {
  title: string;
  metrics: {
    name: string;
    value: number | string;
  }[];
  total?: number | string;
  onRefresh?: () => void;
}

export function SplitMetric({ title, metrics, total, onRefresh }: SplitMetricProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {onRefresh && <RefreshButton onClick={onRefresh} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {metrics.map((metric, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-sm">{metric.name}</span>
              <span className="font-medium">{metric.value}</span>
            </div>
          ))}
          
          {total !== undefined && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{total}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Interface for the ABTestComparison component
interface ABTestComparisonProps {
  title: string;
  description?: string;
  data: {
    anonymous: {
      total: number;
      percentage: string;
      completionRate: string;
      conversionRate: string;
    };
    nonAnonymous: {
      total: number;
      percentage: string;
      completionRate: string;
      conversionRate: string;
    };
    difference: {
      completionRate: string;
      conversionRate: string;
    };
  };
  onRefresh?: () => void;
}

export function ABTestComparison({
  title,
  description,
  data,
  onRefresh,
}: ABTestComparisonProps) {
  // Helper function to determine if a difference is positive
  const isPositive = (value: string): boolean => {
    return value.startsWith('+');
  };

  // Helper function to render difference indicator
  const renderDifferenceIndicator = (value: string) => {
    if (value === '0%') return null;
    const positive = isPositive(value);
    
    return (
      <Badge 
        variant={positive ? "default" : "destructive"}
        className="ml-2 flex items-center"
      >
        {positive ? 
          <TrendingUp className="w-3 h-3 mr-1" /> : 
          <TrendingDown className="w-3 h-3 mr-1" />
        }
        {value}
      </Badge>
    );
  };

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <RefreshButton onClick={onRefresh} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anonymous Users Column */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Anonymous Users
              </CardTitle>
              <CardDescription className="text-xs">
                {data.anonymous.total} users ({data.anonymous.percentage})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span className="font-medium">{data.anonymous.completionRate}</span>
                  </div>
                  <Progress
                    value={parseInt(data.anonymous.completionRate)}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversion Rate</span>
                    <span className="font-medium">{data.anonymous.conversionRate}</span>
                  </div>
                  <Progress
                    value={parseInt(data.anonymous.conversionRate)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Non-Anonymous Users Column */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Non-Anonymous Users
              </CardTitle>
              <CardDescription className="text-xs">
                {data.nonAnonymous.total} users ({data.nonAnonymous.percentage})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span className="font-medium">{data.nonAnonymous.completionRate}</span>
                  </div>
                  <Progress
                    value={parseInt(data.nonAnonymous.completionRate)}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Conversion Rate</span>
                    <span className="font-medium">{data.nonAnonymous.conversionRate}</span>
                  </div>
                  <Progress
                    value={parseInt(data.nonAnonymous.conversionRate)}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Column */}
          <Card className="bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Comparison
              </CardTitle>
              <CardDescription className="text-xs">
                Anonymous vs. Non-Anonymous
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 py-2">
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Completion Rate</span>
                    <div className="flex items-center">
                      {renderDifferenceIndicator(data.difference.completionRate)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isPositive(data.difference.completionRate) || data.difference.completionRate === '0%' ? 
                      'Anonymous users complete the survey more often' : 
                      'Non-anonymous users complete the survey more often'}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Conversion Rate</span>
                    <div className="flex items-center">
                      {renderDifferenceIndicator(data.difference.conversionRate)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {isPositive(data.difference.conversionRate) || data.difference.conversionRate === '0%' ? 
                      'Anonymous users convert better overall' : 
                      'Non-anonymous users convert better overall'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
} 