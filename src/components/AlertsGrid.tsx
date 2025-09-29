import { AlertTriangle, Shield, Zap, Bug, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  vehicleId: string;
  teeId: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    severity: "critical",
    title: "Unauthorized Memory Access Detected",
    description: "TEE integrity violation in vehicle ECU module",
    vehicleId: "VH-2847",
    teeId: "TEE-ECU-01",
    timestamp: "2 min ago",
    status: "active"
  },
  {
    id: "ALT-002", 
    severity: "warning",
    title: "Anomalous Network Traffic",
    description: "Unusual communication pattern from infotainment system",
    vehicleId: "VH-1923",
    teeId: "TEE-INFO-02",
    timestamp: "5 min ago", 
    status: "investigating"
  },
  {
    id: "ALT-003",
    severity: "critical",
    title: "TEE Boot Sequence Anomaly",
    description: "Secure boot verification failed during startup",
    vehicleId: "VH-3456",
    teeId: "TEE-BOOT-01",
    timestamp: "8 min ago",
    status: "active"
  },
  {
    id: "ALT-004",
    severity: "info",
    title: "Security Update Available",
    description: "New firmware available for TEE security module",
    vehicleId: "VH-7890",
    teeId: "TEE-SEC-05",
    timestamp: "12 min ago",
    status: "resolved"
  },
  {
    id: "ALT-005",
    severity: "warning",
    title: "Suspicious Code Execution",
    description: "Unexpected process activity in secure environment",
    vehicleId: "VH-4521",
    teeId: "TEE-PROC-03", 
    timestamp: "15 min ago",
    status: "investigating"
  }
];

const getSeverityIcon = (severity: Alert["severity"]) => {
  switch (severity) {
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-critical" />;
    case "warning":
      return <Zap className="h-4 w-4 text-warning" />;
    case "info":
      return <Shield className="h-4 w-4 text-info" />;
  }
};

const getSeverityBadge = (severity: Alert["severity"]) => {
  switch (severity) {
    case "critical":
      return <Badge variant="destructive" className="bg-critical/20 text-critical border-critical">Critical</Badge>;
    case "warning":
      return <Badge className="bg-warning/20 text-warning border-warning">Warning</Badge>;
    case "info":
      return <Badge className="bg-info/20 text-info border-info">Info</Badge>;
  }
};

const getStatusBadge = (status: Alert["status"]) => {
  switch (status) {
    case "active":
      return <Badge variant="outline" className="border-critical text-critical">Active</Badge>;
    case "investigating":
      return <Badge variant="outline" className="border-warning text-warning">Investigating</Badge>;
    case "resolved":
      return <Badge variant="outline" className="border-success text-success">Resolved</Badge>;
  }
};

export const AlertsGrid = () => {
  return (
    <div className="space-y-4">
      {mockAlerts.map((alert) => (
        <div
          key={alert.id}
          className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getSeverityIcon(alert.severity)}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold">{alert.title}</h4>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Bug className="h-3 w-3" />
                    {alert.vehicleId}
                  </span>
                  <span>TEE: {alert.teeId}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alert.timestamp}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(alert.status)}
              <Button variant="outline" size="sm">
                Investigate
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};