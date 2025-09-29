import { Car, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleStatus {
  id: string;
  model: string;
  location: string;
  teeStatus: "secure" | "warning" | "critical";
  teeCount: {
    total: number;
    secure: number;
    warning: number;
    critical: number;
  };
  lastUpdate: string;
}

const mockVehicles: VehicleStatus[] = [
  {
    id: "VH-2847",
    model: "Model S-2024",
    location: "San Francisco, CA",
    teeStatus: "critical",
    teeCount: { total: 8, secure: 6, warning: 1, critical: 1 },
    lastUpdate: "2 min ago"
  },
  {
    id: "VH-1923", 
    model: "Model X-2023",
    location: "Los Angeles, CA",
    teeStatus: "warning",
    teeCount: { total: 12, secure: 10, warning: 2, critical: 0 },
    lastUpdate: "5 min ago"
  },
  {
    id: "VH-3456",
    model: "Model 3-2024",
    location: "Seattle, WA", 
    teeStatus: "critical",
    teeCount: { total: 6, secure: 4, warning: 1, critical: 1 },
    lastUpdate: "8 min ago"
  },
  {
    id: "VH-7890",
    model: "Model Y-2023",
    location: "Denver, CO",
    teeStatus: "secure",
    teeCount: { total: 10, secure: 10, warning: 0, critical: 0 },
    lastUpdate: "12 min ago"
  },
  {
    id: "VH-4521",
    model: "Model S-2023",
    location: "Austin, TX",
    teeStatus: "warning", 
    teeCount: { total: 8, secure: 7, warning: 1, critical: 0 },
    lastUpdate: "15 min ago"
  },
  {
    id: "VH-9876",
    model: "Model 3-2024",
    location: "Miami, FL",
    teeStatus: "secure",
    teeCount: { total: 6, secure: 6, warning: 0, critical: 0 },
    lastUpdate: "18 min ago"
  }
];

const getStatusIcon = (status: VehicleStatus["teeStatus"]) => {
  switch (status) {
    case "secure":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case "critical":
      return <AlertTriangle className="h-4 w-4 text-critical" />;
  }
};

const getStatusBadge = (status: VehicleStatus["teeStatus"]) => {
  switch (status) {
    case "secure":
      return <Badge className="bg-success/20 text-success border-success">Secure</Badge>;
    case "warning":
      return <Badge className="bg-warning/20 text-warning border-warning">Warning</Badge>;
    case "critical":
      return <Badge variant="destructive" className="bg-critical/20 text-critical border-critical">Critical</Badge>;
  }
};

export const VehicleStatusGrid = () => {
  return (
    <div className="space-y-4">
      {mockVehicles.map((vehicle) => (
        <div
          key={vehicle.id}
          className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/70 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <h4 className="text-sm font-semibold">{vehicle.id}</h4>
                <p className="text-xs text-muted-foreground">{vehicle.model}</p>
              </div>
            </div>
            {getStatusBadge(vehicle.teeStatus)}
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{vehicle.location}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">TEE Status:</span>
              <div className="flex items-center gap-1">
                {getStatusIcon(vehicle.teeStatus)}
                <span className="text-xs">
                  {vehicle.teeCount.secure}/{vehicle.teeCount.total} Secure
                </span>
              </div>
            </div>

            {vehicle.teeCount.warning > 0 || vehicle.teeCount.critical > 0 ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Issues:</span>
                <div className="flex gap-2">
                  {vehicle.teeCount.warning > 0 && (
                    <span className="text-warning">{vehicle.teeCount.warning} Warning</span>
                  )}
                  {vehicle.teeCount.critical > 0 && (
                    <span className="text-critical">{vehicle.teeCount.critical} Critical</span>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                Updated {vehicle.lastUpdate}
              </span>
              <Button variant="outline" size="sm" className="h-6 text-xs px-2">
                Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};