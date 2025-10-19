import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts";

const mockData = [
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
];

export const ThreatChart = () => {
  return (
    <div className="w-full space-y-4">
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="criticalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="warningGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38 92% 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38 92% 50%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="infoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0.1} />
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
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-info" />
          <span className="text-muted-foreground">Benign</span>
        </div>
      </div>
    </div>
  );
};