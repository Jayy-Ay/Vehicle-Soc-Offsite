import React from "react";
import { AlertTriangle, Shield, Car, Activity, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertsGrid } from "./AlertsGrid";
import { VehicleStatusGrid } from "./VehicleStatusGrid";
import { ThreatChart } from "./ThreatChart";
import { SecurityPieChart } from "./SecurityPieChart";
import { useVehicles } from "@/hooks/api/useVehicles";
import { useAlerts } from "@/hooks/api/useAlerts";

export const SOCDashboard = () => {
  const { data: vehicles } = useVehicles();
  const { data: alerts } = useAlerts();
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(null);
  const [durationFilter, setDurationFilter] = React.useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  // Example duration filter logic: last 24h, last 7d, all
  const filterByDuration = (alert: any) => {
    if (!durationFilter || durationFilter === "all") return true;
    const now = Date.now();
    const alertTime = new Date(alert.timestamp).getTime();
    if (durationFilter === "24h") {
      return now - alertTime <= 24 * 60 * 60 * 1000;
    }
    if (durationFilter === "7d") {
      return now - alertTime <= 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  };

  const filteredAlerts = alerts
    ?.filter(a => (severityFilter ? a.severity === severityFilter : true))
    .filter(filterByDuration) || [];

  // Calculate metrics from real data
  const criticalAlerts = filteredAlerts.filter(a => a.severity === 'high').length;
  const totalSecureTEEs = vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;
  const totalTEEs = vehicles?.reduce((sum, v) => sum + v.tee_total, 0) || 0;
  const securePercentage = totalTEEs > 0 ? ((totalSecureTEEs / totalTEEs) * 100).toFixed(1) : '0.0';
  const activeVehicles = vehicles?.length || 0;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle SOC Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time security monitoring for connected vehicle fleet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search vehicles, alerts..." className="pl-9 w-80" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-6 w-fit">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">TEE Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SecurityPieChart />
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-critical">{criticalAlerts}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">High severity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Secure TEEs</CardTitle>
            <Shield className="h-3 w-3 md:h-4 md:w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-success">{totalSecureTEEs}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">{securePercentage}% operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-3 w-3 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-primary">{activeVehicles}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">Fleet online</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Alerts</CardTitle>
            <Activity className="h-3 w-3 md:h-4 md:w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-warning">{filteredAlerts.length}</div>
            <p className="text-[10px] md:text-xs text-muted-foreground">All severities</p>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alerts Section */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <CardTitle>Threat Activity Trends</CardTitle>
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
                      onClick={() => setShowFilterMenu(v => !v)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                    {showFilterMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-popover border rounded shadow-lg z-10 p-4">
                        <div className="mb-4">
                          <label className="block text-xs font-semibold mb-1 text-foreground">Severity</label>
                          <select
                            className="w-full border rounded p-2 bg-background text-foreground border-border"
                            value={severityFilter || ""}
                            onChange={e => setSeverityFilter(e.target.value || null)}
                          >
                            <option value="">All</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-foreground">Duration</label>
                          <select
                            className="w-full border rounded p-2 bg-background text-foreground border-border"
                            value={durationFilter || "all"}
                            onChange={e => setDurationFilter(e.target.value || null)}
                          >
                            <option value="all">All</option>
                            <option value="24h">Last 24 hours</option>
                            <option value="7d">Last 7 days</option>
                          </select>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button size="sm" variant="secondary" onClick={() => setShowFilterMenu(false)}>
                            Close
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
              <AlertsGrid alerts={filteredAlerts} />
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Status Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <CardTitle>Fleet Status</CardTitle>
              <CardDescription>
                Real-time TEE security status by vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleStatusGrid layout="single" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};