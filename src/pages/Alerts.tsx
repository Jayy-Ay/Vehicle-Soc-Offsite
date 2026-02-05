"use client";
import React from "react";
import { AlertsGrid } from "@/components/AlertsGrid";
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
import { Search, Filter, AlertTriangle } from "lucide-react";
import { useAlerts } from "@/hooks/api/useAlerts";
import { AppLayout } from "@/components/AppLayout";

export default function Alerts() {
  const { data: alerts } = useAlerts();
  const [severityFilter, setSeverityFilter] = React.useState<string | null>(
    null,
  );
  const [durationFilter, setDurationFilter] = React.useState<string | null>(
    null,
  );
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  // Duration filter logic: 1h, 24h, 7d, 30d, all
  const filterByDuration = (alert: { timestamp: string }) => {
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

  const highSeverity = filteredAlerts.filter(
    (a) => a.severity === "high",
  ).length;
  const mediumSeverity = filteredAlerts.filter(
    (a) => a.severity === "medium",
  ).length;
  const lowSeverity = filteredAlerts.filter((a) => a.severity === "low").length;
  const benignSeverity = filteredAlerts.filter(
    (a) => a.severity === "benign",
  ).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Security Alerts
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage security alerts across your vehicle fleet
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search alerts..." className="pl-9 w-80" />
            </div>
          </div>
        </div>

        {/* Alert Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredAlerts.length}</div>
              <p className="text-xs text-muted-foreground">All severities</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                High Severity
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-critical" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-critical">
                {highSeverity}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires immediate action
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Medium Severity
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {mediumSeverity}
              </div>
              <p className="text-xs text-muted-foreground">Monitor closely</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Severity
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{lowSeverity}</div>
              <p className="text-xs text-muted-foreground">For review</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benign</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {benignSeverity}
              </div>
              <p className="text-xs text-muted-foreground">No action needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts List */}
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Security Alerts</CardTitle>
                <CardDescription>
                  Complete list of security alerts detected across the fleet
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
              alerts={filteredAlerts.map((a) => ({
                ...a,
                vehicleId: a.vehicle_id,
                teeId: a.tee_id,
              }))}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
