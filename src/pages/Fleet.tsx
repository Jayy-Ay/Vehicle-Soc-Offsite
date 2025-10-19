import { VehicleStatusGrid } from "@/components/VehicleStatusGrid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Car, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useVehicles } from "@/hooks/api/useVehicles";
import { AppLayout } from "@/components/AppLayout";

export default function Fleet() {
  const { data: vehicles } = useVehicles();

  const totalVehicles = vehicles?.length || 0;
  const secureVehicles = vehicles?.filter(v => v.tee_status === 'secure').length || 0;
  const warningVehicles = vehicles?.filter(v => v.tee_status === 'warning').length || 0;
  const criticalVehicles = vehicles?.filter(v => v.tee_status === 'critical').length || 0;

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
            <Input placeholder="Search vehicles..." className="pl-9 w-80" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
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
            <div className="text-2xl font-bold text-primary">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Active fleet</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{secureVehicles}</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningVehicles}</div>
            <p className="text-xs text-muted-foreground">Attention needed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{criticalVehicles}</div>
            <p className="text-xs text-muted-foreground">Immediate action required</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card className="bg-gradient-surface border-border shadow-soc">
        <CardHeader>
          <CardTitle>Vehicle Fleet Status</CardTitle>
          <CardDescription>
            Real-time TEE security status for all vehicles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <VehicleStatusGrid />
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}
