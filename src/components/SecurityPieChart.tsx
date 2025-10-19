import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useVehicles } from "@/hooks/api/useVehicles";

export const SecurityPieChart = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <div className="animate-pulse">
          <div className="w-24 h-24 bg-muted/50 rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <p className="text-xs text-critical">Error loading data</p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <p className="text-xs text-muted-foreground">No data</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      <ResponsiveContainer width="100%" height={75}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={15}
            outerRadius={30}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
