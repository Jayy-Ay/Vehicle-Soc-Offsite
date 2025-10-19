import React from "react";
import { VehicleStatusGrid } from "@/components/VehicleStatusGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Car, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useVehicles } from "@/hooks/api/useVehicles";
import { useCountUp } from "@/hooks/useCountUp";
import { AppLayout } from "@/components/AppLayout";

export default function Fleet() {
  const { data: vehicles } = useVehicles();
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [timeFilter, setTimeFilter] = React.useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Time-based filtering logic
  const filterByTime = (vehicle: any) => {
    if (!timeFilter || timeFilter === "all") return true;
    const now = Date.now();
    const vehicleTime = new Date(vehicle.last_update).getTime();
    
    switch (timeFilter) {
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

  // Search filtering
  const filterBySearch = (vehicle: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      vehicle.vehicle_id.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.location.toLowerCase().includes(query)
    );
  };

  const filteredVehicles = vehicles
    ?.filter(v => (statusFilter ? v.tee_status === statusFilter : true))
    .filter(filterByTime)
    .filter(filterBySearch) || [];

  const totalVehicles = filteredVehicles.length;
  const secureVehicles = filteredVehicles.filter(v => v.tee_status === 'secure').length;
  const warningVehicles = filteredVehicles.filter(v => v.tee_status === 'warning').length;
  const criticalVehicles = filteredVehicles.filter(v => v.tee_status === 'critical').length;

  // Count-up animations for metrics
  const totalVehiclesCount = useCountUp({ end: totalVehicles, duration: 1000 });
  const secureVehiclesCount = useCountUp({ end: secureVehicles, duration: 1200 });
  const warningVehiclesCount = useCountUp({ end: warningVehicles, duration: 1300 });
  const criticalVehiclesCount = useCountUp({ end: criticalVehicles, duration: 1400 });

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your connected vehicle fleet
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search vehicles..." 
              className="pl-9 w-80"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Fleet Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalVehiclesCount.value}</div>
            <p className="text-xs text-muted-foreground">Active fleet</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{secureVehiclesCount.value}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningVehiclesCount.value}</div>
            <p className="text-xs text-muted-foreground">Attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{criticalVehiclesCount.value}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card className="bg-gradient-surface border-border shadow-soc">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Fleet Status</CardTitle>
              <CardDescription>
                Real-time TEE security status for all vehicles
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
                      <label className="block text-xs font-semibold mb-1 text-foreground">Status</label>
                      <select
                        className="w-full border rounded p-2 bg-background text-foreground border-border"
                        value={statusFilter || ""}
                        onChange={e => setStatusFilter(e.target.value || null)}
                      >
                        <option value="">All</option>
                        <option value="secure">Secure</option>
                        <option value="warning">Warning</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-foreground">Last Update</label>
                      <select
                        className="w-full border rounded p-2 bg-background text-foreground border-border"
                        value={timeFilter || "all"}
                        onChange={e => setTimeFilter(e.target.value || null)}
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
                          setStatusFilter(null);
                          setTimeFilter(null);
                          setSearchQuery("");
                        }}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {totalVehicles} of {vehicles?.length || 0} vehicles
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VehicleStatusGrid vehicles={filteredVehicles} />
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}
