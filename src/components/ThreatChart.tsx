"use client";
import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Button } from "@/components/ui/button";
import { format, subDays, subHours, subMonths, subYears } from "date-fns";

interface ThreatChartProps {
  timeFilter?: "1h" | "24h" | "7d" | "30d" | "1y";
}

const TIME_FILTERS = [
  { key: "1h", label: "1H", description: "Last hour" },
  { key: "24h", label: "24H", description: "Last 24 hours" },
  { key: "7d", label: "7D", description: "Last 7 days" },
  { key: "30d", label: "30D", description: "Last 30 days" },
  { key: "1y", label: "1Y", description: "Last year" },
] as const;

// Mock data for different time periods
const mockDataSets = {
  "1h": [
    { time: "13:00", critical: 1, warning: 3, info: 5 },
    { time: "13:10", critical: 2, warning: 2, info: 4 },
    { time: "13:20", critical: 0, warning: 4, info: 6 },
    { time: "13:30", critical: 3, warning: 1, info: 3 },
    { time: "13:40", critical: 1, warning: 5, info: 7 },
    { time: "13:50", critical: 2, warning: 3, info: 5 },
  ],
  "24h": [
    { time: "00:00", critical: 2, warning: 8, info: 12 },
    { time: "02:00", critical: 1, warning: 6, info: 15 },
    { time: "04:00", critical: 3, warning: 4, info: 9 },
    { time: "06:00", critical: 0, warning: 7, info: 18 },
    { time: "08:00", critical: 4, warning: 12, info: 22 },
    { time: "10:00", critical: 2, warning: 9, info: 16 },
    { time: "12:00", critical: 5, warning: 15, info: 25 },
    { time: "14:00", critical: 3, warning: 11, info: 19 },
    { time: "16:00", critical: 7, warning: 18, info: 28 },
    { time: "18:00", critical: 4, warning: 13, info: 21 },
    { time: "20:00", critical: 6, warning: 16, info: 24 },
    { time: "22:00", critical: 2, warning: 8, info: 14 },
  ],
  "7d": [
    { time: "Oct 13", critical: 15, warning: 45, info: 78 },
    { time: "Oct 14", critical: 12, warning: 38, info: 82 },
    { time: "Oct 15", critical: 18, warning: 52, info: 95 },
    { time: "Oct 16", critical: 8, warning: 41, info: 73 },
    { time: "Oct 17", critical: 22, warning: 58, info: 104 },
    { time: "Oct 18", critical: 14, warning: 47, info: 89 },
    { time: "Oct 19", critical: 19, warning: 55, info: 92 },
  ],
  "30d": [
    { time: "Sep 20", critical: 45, warning: 128, info: 234 },
    { time: "Sep 25", critical: 38, warning: 142, info: 198 },
    { time: "Sep 30", critical: 52, warning: 156, info: 267 },
    { time: "Oct 05", critical: 41, warning: 134, info: 223 },
    { time: "Oct 10", critical: 48, warning: 167, info: 289 },
    { time: "Oct 15", critical: 36, warning: 145, info: 212 },
    { time: "Oct 19", critical: 43, warning: 159, info: 245 },
  ],
  "1y": [
    { time: "Jan 2025", critical: 156, warning: 423, info: 678 },
    { time: "Feb 2025", critical: 142, warning: 398, info: 712 },
    { time: "Mar 2025", critical: 168, warning: 456, info: 634 },
    { time: "Apr 2025", critical: 134, warning: 412, info: 589 },
    { time: "May 2025", critical: 178, warning: 467, info: 723 },
    { time: "Jun 2025", critical: 145, warning: 434, info: 656 },
    { time: "Jul 2025", critical: 162, warning: 445, info: 698 },
    { time: "Aug 2025", critical: 139, warning: 421, info: 612 },
    { time: "Sep 2025", critical: 171, warning: 458, info: 734 },
    { time: "Oct 2025", critical: 154, warning: 439, info: 667 },
  ],
};

export const ThreatChart = ({
  timeFilter: propTimeFilter,
}: ThreatChartProps) => {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>(
    propTimeFilter || "24h"
  );

  const chartData = useMemo(() => {
    return (
      mockDataSets[selectedTimeFilter as keyof typeof mockDataSets] ||
      mockDataSets["24h"]
    );
  }, [selectedTimeFilter]);

  return (
    <div className="w-full space-y-4">
      {/* Time Filter Buttons */}
      <div className="flex justify-center gap-2">
        {TIME_FILTERS.map((filter) => (
          <Button
            key={filter.key}
            variant={selectedTimeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeFilter(filter.key)}
            className="h-8 px-3"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(0 84% 60%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(0 84% 60%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(217 91% 60%)"
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(217 91% 60%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 20%)" />
            <XAxis
              dataKey="time"
              stroke="hsl(215 20% 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215 20% 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Area
              type="monotone"
              dataKey="critical"
              stackId="1"
              stroke="hsl(0 84% 60%)"
              fill="url(#criticalGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="warning"
              stackId="1"
              stroke="hsl(38 92% 50%)"
              fill="url(#warningGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="info"
              stackId="1"
              stroke="hsl(217 91% 60%)"
              fill="url(#infoGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-critical" />
          <span className="text-muted-foreground">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-info" />
          <span className="text-muted-foreground">Low/Benign</span>
        </div>
      </div>
    </div>
  );
};
