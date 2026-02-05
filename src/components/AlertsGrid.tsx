import { AlertTriangle, Shield, Zap, Bug, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Format timestamp to human readable format
const formatTimestamp = (timestamp: string) => {
  // If it's already in relative format (like "2 min ago"), return as-is
  if (timestamp.includes("ago") || timestamp.includes("min") || timestamp.includes("hour")) {
    return timestamp;
  }
  
  // If it's an ISO timestamp, convert it
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    return timestamp; // Return original if parsing fails
  }
};

interface Alert {
  id: string;
  severity: "high" | "medium" | "low" | "benign";
  title: string;
  description: string;
  vehicleId: string;
  teeId: string;
  timestamp: string;
  status: "pending" | "investigating" | "resolved";
}

const mockAlerts: Alert[] = [
  {
    id: "ALT-001",
    severity: "high",
    title: "Unauthorized Memory Access Detected",
    description: "TEE integrity violation in vehicle ECU module",
    vehicleId: "VH-2847",
    teeId: "TEE-ECU-01",
    timestamp: "2 min ago",
    status: "pending"
  },
  {
    id: "ALT-002", 
    severity: "low",
    title: "Anomalous Network Traffic",
    description: "Unusual communication pattern from infotainment system",
    vehicleId: "VH-1923",
    teeId: "TEE-INFO-02",
    timestamp: "5 min ago", 
    status: "investigating"
  },
  {
    id: "ALT-003",
    severity: "high",
    title: "TEE Boot Sequence Anomaly",
    description: "Secure boot verification failed during startup",
    vehicleId: "VH-3456",
    teeId: "TEE-BOOT-01",
    timestamp: "8 min ago",
    status: "pending"
  },
  {
    id: "ALT-004",
    severity: "benign",
    title: "Security Update Available",
    description: "New firmware available for TEE security module",
    vehicleId: "VH-7890",
    teeId: "TEE-SEC-05",
    timestamp: "12 min ago",
    status: "resolved"
  },
  {
    id: "ALT-005",
    severity: "low",
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
    case "high":
      return <AlertTriangle className="h-4 w-4 text-critical" />;
    case "medium":
      return <Zap className="h-4 w-4 text-warning" />;
    case "low":
      return <Zap className="h-4 w-4 text-warning" />;
    case "benign":
      return <Shield className="h-4 w-4 text-info" />;
  }
};

const getSeverityBadge = (severity: Alert["severity"]) => {
  switch (severity) {
    case "high":
      return <Badge variant="destructive" className="bg-critical/20 text-critical border-critical">High</Badge>;
    case "medium":
      return <Badge className="bg-warning/20 text-warning border-warning">Medium</Badge>;
    case "low":
      return <Badge className="bg-warning/20 text-warning border-warning">Low</Badge>;
    case "benign":
      return <Badge className="bg-info/20 text-info border-info">Benign</Badge>;
  }
};

const getStatusBadge = (status: Alert["status"]) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="border-muted-foreground text-muted-foreground">Pending</Badge>;
    case "investigating":
      return <Badge variant="outline" className="border-warning text-warning">Investigating</Badge>;
    case "resolved":
      return <Badge variant="outline" className="border-success text-success">Resolved</Badge>;
  }
};

export const AlertsGrid = ({ alerts, simplified = false }: { alerts?: Alert[], simplified?: boolean }) => {
  const displayAlerts = alerts ?? mockAlerts;
  
  if (simplified) {
    // Simplified version for dashboard - show only top 5 alerts
    const topAlerts = displayAlerts.slice(0, 5);
    
    return (
      <div className="space-y-2">
        {topAlerts.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No alerts found.</div>
        ) : (
          topAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-3 rounded-lg border border-border bg-card/30 hover:bg-card/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span>{alert.vehicleId}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getSeverityBadge(alert.severity)}
                </div>
              </div>
            </div>
          ))
        )}
        {displayAlerts.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              +{displayAlerts.length - 5} more alerts
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Full version for dedicated alerts page
  return (
    <div className="space-y-4">
      {displayAlerts.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">No alerts found.</div>
      ) : (
        displayAlerts.map((alert) => (
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
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bug className="h-3 w-3" />
                      {alert.vehicleId}
                    </span>
                    {alert.teeId && <span>TEE: {alert.teeId}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimestamp(alert.timestamp)}
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
        ))
      )}
    </div>
  );
};