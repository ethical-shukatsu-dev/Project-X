import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';

// Match score interface matching CompanyCard
interface MatchingScore {
  name: string;
  score: number;
  details?: string;
  category?: string;
  matchPoints?: string[];
}

interface MatchScoreChartProps {
  matchingScores: MatchingScore[];
  className?: string;
}

// Define a type for the chart data
interface ChartData {
  category: string;
  value: number;
  fullMark: number;
  details?: string;
  matchCategory?: string;
  matchPoints?: string[];
}

// Custom tooltip component to show the matching points
const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ChartData;
    return (
      <div className="border border-white/10 shadow-lg max-w-xs p-2 rounded-md backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
        <p className="font-semibold text-sm">
          {data.category}: {data.value}
        </p>

        {/* If we have detailed explanation, show it */}
        {data.details && (
          <p className="mt-1 text-xs text-gray-800 dark:text-gray-200 italic">{data.details}</p>
        )}

        {/* If we have specific matching points, show them as a list */}
        {data.matchPoints && data.matchPoints.length > 0 ? (
          <ul className="mt-1 text-xs text-gray-800 dark:text-gray-200 list-disc pl-4">
            {data.matchPoints.slice(0, 3).map((point: string, i: number) => (
              <li key={i} className="line-clamp-2">
                {point}
              </li>
            ))}
            {data.matchPoints.length > 3 && (
              <li className="text-gray-800 dark:text-gray-200 italic">
                +{data.matchPoints.length - 3} more
              </li>
            )}
          </ul>
        ) : null}

        {/* Show the category if available */}
        {data.matchCategory && (
          <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">{data.matchCategory}</p>
        )}
      </div>
    );
  }
  return null;
};

export function MatchScoreChart({ matchingScores, className = '' }: MatchScoreChartProps) {
  // Format data for the radar chart
  const data = matchingScores.map((item) => ({
    category: item.name,
    value: Math.round(item.score), // Ensure integer for clean display
    fullMark: 100,
    details: item.details || '',
    matchCategory: item.category || 'Match Score',
    matchPoints: item.matchPoints || [],
  }));

  // Calculate container height based on viewport
  const getContainerHeight = () => {
    if (typeof window === 'undefined') return 192; // 12rem (h-48) default
    if (window.innerWidth >= 768) return 256; // md:h-64
    if (window.innerWidth >= 640) return 208; // sm:h-52
    return 192; // h-48
  };

  const [containerHeight, setContainerHeight] = React.useState(getContainerHeight());

  // Update height on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setContainerHeight(getContainerHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100%', height: containerHeight }} className={className}>
      <ResponsiveContainer width="100%" height={containerHeight}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: 'rgba(255, 255, 255, 0.8)', fontSize: 10 }}
            // If value is too long add ellipsis
            tickFormatter={(value) => {
              if (value.length > 10) {
                return value.slice(0, 10) + '...';
              }
              return value;
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickCount={10}
          />
          <Radar
            name="Match Score"
            dataKey="value"
            stroke="rgb(59, 130, 246)" // Blue color to match the button gradient
            fill="rgba(59, 130, 246, 0.3)" // Transparent blue fill
            fillOpacity={0.6}
            activeDot={{ r: 6, strokeWidth: 0, fill: 'rgb(124, 58, 237)' }}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
