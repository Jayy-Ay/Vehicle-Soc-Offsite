import React from "react";
import {
  AlertTriangle,
  Shield,
  Car,
  Activity,
  Search,
  Filter,
  Wifi,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertsGrid } from "./AlertsGrid";
import { VehicleStatusGrid } from "./VehicleStatusGrid";
import { ThreatChart } from "./ThreatChart";
import { SecurityPieChart } from "./SecurityPieChart";
import { useVehicles } from "@/hooks/api/useVehicles";
import { useAlerts } from "@/hooks/api/useAlerts";
import { useCountUp } from "@/hooks/useCountUp";

export const SOCDashboard = () => {
  const { data: vehicles } = useVehicles();
  const { data: alerts } = useAlerts();
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(
    null,
  );
  const [durationFilter, setDurationFilter] = React.useState<string | null>(
    null,
  );
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  // Fleet status filters
  const [fleetStatusFilter, setFleetStatusFilter] = React.useState<
    string | null
  >(null);
  const [fleetTimeFilter, setFleetTimeFilter] = React.useState<string | null>(
    null,
  );
  const [showFleetFilterMenu, setShowFleetFilterMenu] = React.useState(false);

  // Duration filter logic: 1h, 24h, 7d, 30d, all
  const filterByDuration = (alert: { timestamp: string | number | Date }) => {
    if (!durationFilter || durationFilter === "all") return true;
    const now = Date.now();
    const alertTime = new Date(alert.timestamp).getTime();

    switch (durationFilter) {
      case "1h":
        return now - alertTime <= 60 * 60 * 1000;
      case "24h":
        return now - alertTime <= 24 * 60 * 60 * 1000;
      case "7d":
        return now - alertTime <= 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - alertTime <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  };

  const filteredAlerts =
    alerts
      ?.filter((a) => (severityFilter ? a.severity === severityFilter : true))
      .filter(filterByDuration) || [];

  // Fleet filtering logic
  const filterFleetByTime = (vehicle: {
    last_update: string | number | Date;
  }) => {
    if (!fleetTimeFilter || fleetTimeFilter === "all") return true;
    const now = Date.now();
    const vehicleTime = new Date(vehicle.last_update).getTime();

    switch (fleetTimeFilter) {
      case "1h":
        return now - vehicleTime <= 60 * 60 * 1000;
      case "24h":
        return now - vehicleTime <= 24 * 60 * 60 * 1000;
      case "7d":
        return now - vehicleTime <= 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return now - vehicleTime <= 30 * 24 * 60 * 60 * 1000;
      default:
        return true;
    }
  };

  const filteredVehicles =
    vehicles
      ?.filter((v) =>
        fleetStatusFilter ? v.tee_status === fleetStatusFilter : true,
      )
      .filter(filterFleetByTime) || [];

  // Calculate metrics from real data
  const criticalAlerts = filteredAlerts.filter(
    (a) => a.severity === "high",
  ).length;
  const totalSecureTEEs =
    vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;
  const totalTEEs = vehicles?.reduce((sum, v) => sum + v.tee_total, 0) || 0;
  const securePercentage =
    totalTEEs > 0 ? (totalSecureTEEs / totalTEEs) * 100 : 0;
  const activeVehicles = vehicles?.length || 0;

  // Count-up animations for metrics
  const criticalAlertsCount = useCountUp({
    end: criticalAlerts,
    duration: 1200,
  });
  const secureTEEsCount = useCountUp({ end: totalSecureTEEs, duration: 1500 });
  const activeVehiclesCount = useCountUp({
    end: activeVehicles,
    duration: 1000,
  });
  const totalAlertsCount = useCountUp({
    end: filteredAlerts.length,
    duration: 1300,
  });
  const securePercentageCount = useCountUp({
    end: securePercentage,
    duration: 1400,
    decimals: 1,
  });
  return (
    <div className="space-y-6 relative">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            background:
              "linear-gradient(45deg, #3b82f6, #10b981, #f59e0b, #ef4444)",
            backgroundSize: "400% 400%",
            animation: "gradientShift 15s ease infinite",
          }}
        />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 w-2 h-2 bg-primary/20 rounded-full animate-pulse"
          style={{ animation: "float 4s ease-in-out infinite" }}
        ></div>
        <div
          className="absolute top-32 right-20 w-1 h-1 bg-success/30 rounded-full animate-ping"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-warning/25 rounded-full animate-pulse"
          style={{
            animation: "float 6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        ></div>
        <div
          className="absolute top-1/2 right-10 w-1 h-1 bg-info/40 rounded-full animate-ping"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-2 h-2 bg-primary/15 rounded-full animate-pulse"
          style={{
            animation: "float 5s ease-in-out infinite",
            animationDelay: "1s",
          }}
        ></div>
        <div
          className="absolute top-1/4 left-1/2 w-1 h-1 bg-critical/20 rounded-full animate-ping"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute bottom-32 left-10 w-1.5 h-1.5 bg-success/25 rounded-full"
          style={{
            animation: "float 7s ease-in-out infinite",
            animationDelay: "2.5s",
          }}
        ></div>
      </div>

      {/* Floating Network Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Wifi
          className="absolute top-16 right-1/4 h-4 w-4 text-primary/10 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "3s" }}
        />
        <Zap
          className="absolute bottom-32 left-16 h-3 w-3 text-warning/15 animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "4s" }}
        />
        <Shield
          className="absolute top-1/3 left-1/3 h-3 w-3 text-success/12 animate-bounce"
          style={{ animationDelay: "2.5s", animationDuration: "3.5s" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Vehicle SOC Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time security monitoring for connected vehicle fleet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input
              placeholder="Search vehicles, alerts..."
              className="pl-9 w-80 hover:border-primary/50 focus:border-primary transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="hover:scale-105 transition-transform duration-200 hover:border-primary/50 hover:bg-primary/5"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="flex justify-center relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 w-fit">
          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-lg transition-all duration-300 hover:scale-105 group aspect-square h-32 md:h-40 flex flex-col">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center gap-1">
                TEE Distribution
                <div className="w-1 h-1 bg-success rounded-full animate-pulse"></div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-2">
              <SecurityPieChart />
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-lg transition-all duration-300 hover:scale-105 group aspect-square h-32 md:h-40 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Critical Alerts
              </CardTitle>
              <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-critical animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-critical">
                {criticalAlertsCount.value}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                High severity
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-lg transition-all duration-300 hover:scale-105 group aspect-square h-32 md:h-40 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Secure TEEs
              </CardTitle>
              <Shield className="h-3 w-3 md:h-4 md:w-4 text-success animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-success">
                {secureTEEsCount.value.toLocaleString()}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {securePercentageCount.value}% operational
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-lg transition-all duration-300 hover:scale-105 group aspect-square h-32 md:h-40 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Vehicles
              </CardTitle>
              <Car className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-primary">
                {activeVehiclesCount.value}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Fleet online
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-lg transition-all duration-300 hover:scale-105 group aspect-square h-32 md:h-40 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">
                Total Alerts
              </CardTitle>
              <Activity className="h-3 w-3 md:h-4 md:w-4 text-warning animate-pulse" />
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              <div className="text-xl md:text-2xl font-bold text-warning">
                {totalAlertsCount.value}
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                All severities
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
        {/* Alerts Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-xl transition-all duration-500 group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Threat Activity Trends
                <div className="w-2 h-2 bg-gradient-to-r from-primary to-warning rounded-full animate-pulse group-hover:animate-spin"></div>
              </CardTitle>
              <CardDescription>
                Anomaly detection patterns over the last 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThreatChart />
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Security Alerts</CardTitle>
                  <CardDescription>
                    Latest anomalous behavior detected from vehicle TEEs
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilterMenu((v) => !v)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    {showFilterMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-popover border rounded shadow-lg z-10 p-4">
                        <div className="mb-4">
                          <label className="block text-xs font-semibold mb-1 text-foreground">
                            Severity
                          </label>
                          <select
                            className="w-full border rounded p-2 bg-background text-foreground border-border"
                            value={severityFilter || ""}
                            onChange={(e) =>
                              setSeverityFilter(e.target.value || null)
                            }
                          >
                            <option value="">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                            <option value="benign">Benign</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-foreground">
                            Duration
                          </label>
                          <select
                            className="w-full border rounded p-2 bg-background text-foreground border-border"
                            value={durationFilter || "all"}
                            onChange={(e) =>
                              setDurationFilter(e.target.value || null)
                            }
                          >
                            <option value="all">All</option>
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                          </select>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSeverityFilter(null);
                              setDurationFilter(null);
                            }}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Badge variant="destructive" className="bg-gradient-critical">
                    Live
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AlertsGrid
                simplified
                alerts={filteredAlerts.map((a) => ({
                  ...a,
                  vehicleId: a.vehicle_id,
                  teeId: a.tee_id,
                }))}
              />
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Status Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-surface border-border shadow-soc hover:shadow-xl transition-all duration-500 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Fleet Status
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse group-hover:animate-bounce"></div>
                  </CardTitle>
                  <CardDescription>
                    Real-time TEE security status by vehicle
                  </CardDescription>
                </div>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFleetFilterMenu((v) => !v)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                  {showFleetFilterMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-popover border rounded shadow-lg z-10 p-4">
                      <div className="mb-4">
                        <label className="block text-xs font-semibold mb-1 text-foreground">
                          Status
                        </label>
                        <select
                          className="w-full border rounded p-2 bg-background text-foreground border-border"
                          value={fleetStatusFilter || ""}
                          onChange={(e) =>
                            setFleetStatusFilter(e.target.value || null)
                          }
                        >
                          <option value="">All</option>
                          <option value="secure">Secure</option>
                          <option value="warning">Warning</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 text-foreground">
                          Last Update
                        </label>
                        <select
                          className="w-full border rounded p-2 bg-background text-foreground border-border"
                          value={fleetTimeFilter || "all"}
                          onChange={(e) =>
                            setFleetTimeFilter(e.target.value || null)
                          }
                        >
                          <option value="all">All Time</option>
                          <option value="1h">Last Hour</option>
                          <option value="24h">Last 24 Hours</option>
                          <option value="7d">Last 7 Days</option>
                          <option value="30d">Last 30 Days</option>
                        </select>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFleetStatusFilter(null);
                            setFleetTimeFilter(null);
                          }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VehicleStatusGrid layout="single" vehicles={filteredVehicles} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
