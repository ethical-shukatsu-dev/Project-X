import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, description, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-1">
            <span className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConversionFunnelProps {
  title: string;
  steps: {
    name: string;
    value: number;
  }[];
  rates: {
    name: string;
    value: string;
  }[];
}

export function ConversionFunnel({ title, steps, rates }: ConversionFunnelProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Conversion funnel and rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-bold">{step.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{step.name}</div>
              </div>
            ))}
          </div>
          
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            {steps.length > 0 && steps[0].value > 0 && (
              <>
                <div 
                  className="absolute h-full bg-primary rounded-full" 
                  style={{ width: `${Math.min(100, (steps[1].value / steps[0].value) * 100)}%` }}
                />
                <div 
                  className="absolute h-full bg-green-500 rounded-full" 
                  style={{ width: `${Math.min(100, (steps[2].value / steps[0].value) * 100)}%` }}
                />
              </>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            {rates.map((rate, i) => (
              <div key={i} className="text-center">
                <div className="text-lg font-semibold">{rate.value}</div>
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
}

export function SplitMetric({ title, metrics, total }: SplitMetricProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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