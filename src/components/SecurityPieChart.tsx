import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useVehicles } from "@/hooks/api/useVehicles";

interface SecurityPieChartProps {
  size?: "small" | "large";
}

export const SecurityPieChart = ({ size = "small" }: SecurityPieChartProps) => {
  const { data: vehicles, isLoading, error } = useVehicles();

  // Calculate totals from real vehicle data
  const totals = vehicles?.reduce(
    (acc, vehicle) => ({
      secure: acc.secure + vehicle.tee_secure,
      warning: acc.warning + vehicle.tee_warning,
      critical: acc.critical + vehicle.tee_critical,
    }),
    { secure: 0, warning: 0, critical: 0 }
  ) || { secure: 0, warning: 0, critical: 0 };

  const chartData = [
    { name: "Secure", value: totals.secure, color: "hsl(var(--success))" },
    { name: "Warning", value: totals.warning, color: "hsl(var(--warning))" },
    { name: "Critical", value: totals.critical, color: "hsl(var(--critical))" },
  ];

  const isLarge = size === "large";
  const containerHeight = isLarge ? "h-[300px]" : "h-[180px]";
  const chartHeight = isLarge ? 250 : 75;
  const innerRadius = isLarge ? 60 : 15;
  const outerRadius = isLarge ? 120 : 30;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${containerHeight}`}>
        <div className="animate-pulse">
          <div className={`${isLarge ? 'w-48 h-48' : 'w-24 h-24'} bg-muted/50 rounded-full mx-auto`} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${containerHeight}`}>
        <p className="text-xs text-critical">Error loading data</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className={`flex items-center justify-center ${containerHeight}`}>
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={chartHeight}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
            stroke="hsl(var(--border))"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {isLarge && (
        <div className="flex justify-center">
          <div className="flex gap-6">
            {chartData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium">{entry.name}</span>
                <span className="text-sm text-muted-foreground">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
