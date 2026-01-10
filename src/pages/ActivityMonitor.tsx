import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useAlerts } from "@/hooks/api/useAlerts";
import { useVehicles } from "@/hooks/api/useVehicles";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { formatDistanceToNow } from "date-fns";

export default function ActivityMonitor() {
  const { data: alerts } = useAlerts();
  const { data: vehicles } = useVehicles();

  const recentAlerts = alerts?.slice(0, 10) || [];
  const recentVehicleUpdates = vehicles
    ?.sort((a, b) => new Date(b.last_update).getTime() - new Date(a.last_update).getTime())
    .slice(0, 10) || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="bg-critical/20 text-critical border-critical">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning/20 text-warning border-warning">Medium</Badge>;
      case 'low':
        return <Badge className="bg-info/20 text-info border-info">Low</Badge>;
      case 'benign':
        return <Badge className="bg-success/20 text-success border-success">Benign</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'secure':
        return <Badge className="bg-success/20 text-success border-success">Secure</Badge>;
      case 'warning':
        return <Badge className="bg-warning/20 text-warning border-warning">Warning</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="bg-critical/20 text-critical border-critical">Critical</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Monitor</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of system activities and events
        </p>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{(alerts?.length || 0) + (vehicles?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{alerts?.filter(a => a.status === 'pending' || a.status === 'investigating').length || 0}</div>
            <p className="text-xs text-muted-foreground">Pending resolution</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{alerts?.filter(a => a.status === 'resolved').length || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">12m</div>
            <p className="text-xs text-muted-foreground">Time to resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <CardTitle>Recent Security Alerts</CardTitle>
            <CardDescription>
              Latest security events and alerts detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.id}
                  className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{alert.alert_type}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{alert.vehicle_id}</p>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
              {recentAlerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No recent alerts</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <CardTitle>Vehicle Status Updates</CardTitle>
            <CardDescription>
              Recent vehicle TEE status changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVehicleUpdates.map((vehicle) => (
                <div 
                  key={vehicle.id}
                  className="p-3 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{vehicle.vehicle_id}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{vehicle.location}</p>
                    </div>
                    {getStatusBadge(vehicle.tee_status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      TEE: {vehicle.tee_secure}/{vehicle.tee_total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(vehicle.last_update), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {recentVehicleUpdates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No recent updates</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  );
}
