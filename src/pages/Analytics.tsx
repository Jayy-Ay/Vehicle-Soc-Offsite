import { ThreatChart } from "@/components/ThreatChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useVehicles } from "@/hooks/api/useVehicles";
import { useAlerts } from "@/hooks/api/useAlerts";
import { AppLayout } from "@/components/AppLayout";

export default function Analytics() {
  const { data: vehicles } = useVehicles();
  const { data: alerts } = useAlerts();

  const totalVehicles = vehicles?.length || 0;
  const totalAlerts = alerts?.length || 0;
  const totalTEEs = vehicles?.reduce((sum, v) => sum + v.tee_total, 0) || 0;
  const secureTEEs = vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;
  const securePercentage = totalTEEs > 0 ? ((secureTEEs / totalTEEs) * 100).toFixed(1) : '0.0';

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive security analytics and insights
        </p>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              Active vehicles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Health</CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{securePercentage}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              TEE security rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Activity className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-success" />
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TEE Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">{totalTEEs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-success" />
              Total TEEs monitored
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <CardTitle>Threat Activity Trends</CardTitle>
            <CardDescription>
              Security threat patterns and anomaly detection over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ThreatChart />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <CardTitle>Security Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for fleet security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Secure Vehicles</span>
                  <span className="text-sm font-bold text-success">
                    {vehicles?.filter(v => v.tee_status === 'secure').length || 0} / {totalVehicles}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full"
                    style={{ 
                      width: `${totalVehicles > 0 ? ((vehicles?.filter(v => v.tee_status === 'secure').length || 0) / totalVehicles) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Warning Vehicles</span>
                  <span className="text-sm font-bold text-warning">
                    {vehicles?.filter(v => v.tee_status === 'warning').length || 0} / {totalVehicles}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full"
                    style={{ 
                      width: `${totalVehicles > 0 ? ((vehicles?.filter(v => v.tee_status === 'warning').length || 0) / totalVehicles) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Critical Vehicles</span>
                  <span className="text-sm font-bold text-critical">
                    {vehicles?.filter(v => v.tee_status === 'critical').length || 0} / {totalVehicles}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-critical h-2 rounded-full"
                    style={{ 
                      width: `${totalVehicles > 0 ? ((vehicles?.filter(v => v.tee_status === 'critical').length || 0) / totalVehicles) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-surface border-border shadow-soc">
            <CardHeader>
              <CardTitle>Alert Distribution</CardTitle>
              <CardDescription>
                Security alerts breakdown by severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">High Severity</span>
                  <span className="text-sm font-bold text-critical">
                    {alerts?.filter(a => a.severity === 'high').length || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-critical h-2 rounded-full"
                    style={{ 
                      width: `${totalAlerts > 0 ? ((alerts?.filter(a => a.severity === 'high').length || 0) / totalAlerts) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Medium Severity</span>
                  <span className="text-sm font-bold text-warning">
                    {alerts?.filter(a => a.severity === 'medium').length || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-warning h-2 rounded-full"
                    style={{ 
                      width: `${totalAlerts > 0 ? ((alerts?.filter(a => a.severity === 'medium').length || 0) / totalAlerts) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Low Severity</span>
                  <span className="text-sm font-bold text-info">
                    {alerts?.filter(a => a.severity === 'low').length || 0}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-info h-2 rounded-full"
                    style={{ 
                      width: `${totalAlerts > 0 ? ((alerts?.filter(a => a.severity === 'low').length || 0) / totalAlerts) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </AppLayout>
  );
}
