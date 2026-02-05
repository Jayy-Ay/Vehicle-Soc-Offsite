import { SecurityPieChart } from "@/components/SecurityPieChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, CheckCircle, Server } from "lucide-react";
import { useVehicles } from "@/hooks/api/useVehicles";
import { AppLayout } from "@/components/AppLayout";

export default function TEESecurity() {
  const { data: vehicles } = useVehicles();

  const totalTEEs = vehicles?.reduce((sum, v) => sum + v.tee_total, 0) || 0;
  const secureTEEs = vehicles?.reduce((sum, v) => sum + v.tee_secure, 0) || 0;
  const warningTEEs = vehicles?.reduce((sum, v) => sum + v.tee_warning, 0) || 0;
  const criticalTEEs = vehicles?.reduce((sum, v) => sum + v.tee_critical, 0) || 0;
  const securePercentage = totalTEEs > 0 ? ((secureTEEs / totalTEEs) * 100).toFixed(1) : '0.0';

  return (
    <AppLayout>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TEE Security</h1>
        <p className="text-muted-foreground">
          Trusted Execution Environment security monitoring and analytics
        </p>
      </div>

      {/* TEE Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TEEs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTEEs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all vehicles</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secure TEEs</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{secureTEEs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{securePercentage}% of total</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning TEEs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{warningTEEs}</div>
            <p className="text-xs text-muted-foreground">Requires monitoring</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical TEEs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-critical" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-critical">{criticalTEEs}</div>
            <p className="text-xs text-muted-foreground">Immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* TEE Distribution and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <CardTitle>TEE Security Distribution</CardTitle>
            <CardDescription>
              Overall security status breakdown across the fleet
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[400px]">
            <SecurityPieChart size="large" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-surface border-border shadow-soc">
          <CardHeader>
            <CardTitle>TEE Health Status</CardTitle>
            <CardDescription>
              Security health metrics for Trusted Execution Environments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Security Health</span>
                <span className="text-sm font-bold text-success">{securePercentage}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-success h-3 rounded-full transition-all"
                  style={{ width: `${securePercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {secureTEEs.toLocaleString()} out of {totalTEEs.toLocaleString()} TEEs are operating securely
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-medium">Secure</span>
                </div>
                <span className="text-lg font-bold text-success">{secureTEEs.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span className="text-sm font-medium">Warning</span>
                </div>
                <span className="text-lg font-bold text-warning">{warningTEEs}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-critical/10 border border-critical/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-critical" />
                  <span className="text-sm font-medium">Critical</span>
                </div>
                <span className="text-lg font-bold text-critical">{criticalTEEs}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AppLayout>
  );
}
