import { Car, Shield, AlertTriangle, CheckCircle, Calendar, MapPin, Activity, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useVehicles } from "@/hooks/api/useVehicles";
import { formatDistanceToNow, format } from "date-fns";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Database } from "@/lib/database.types";

interface VehicleStatusGridProps {
  layout?: "single" | "grid";
}

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

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

export const VehicleStatusGrid = ({ layout = "grid" }: VehicleStatusGridProps) => {
  const { data: vehicles, isLoading, error } = useVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDetailsClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border bg-card/50 animate-pulse"
          >
            <div className="h-20 bg-muted/50 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <p className="text-sm text-critical">Error loading vehicles</p>
        <p className="text-xs text-muted-foreground mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card/50">
        <p className="text-sm text-muted-foreground">No vehicles found</p>
      </div>
    );
  }

  const containerClass = layout === "single" 
    ? "space-y-4" 
    : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";

  return (
    <>
      <TooltipProvider>
        <div className={containerClass}>
          {vehicles.map((vehicle) => {
            const lastUpdate = formatDistanceToNow(new Date(vehicle.last_update), { addSuffix: true });
            // Remove "about" prefix if present
            const cleanedUpdate = lastUpdate.replace(/^about\s+/, '');
            
            return (
              <Tooltip key={vehicle.id}>
                <TooltipTrigger asChild>
                  <div
                    className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/70 hover:border-primary hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => handleDetailsClick(vehicle)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-semibold">{vehicle.vehicle_id}</h4>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">{vehicle.location}</div>
                        
                        <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {cleanedUpdate}
                          </div>
                        </div>
                      </div>

                      {/* Right side column - aligned */}
                      <div className="flex flex-col items-end gap-3 min-w-[100px]">
                        {getStatusBadge(vehicle.tee_status)}
                        
                        <div className="flex items-center gap-1 mr-2">
                          {getStatusIcon(vehicle.tee_status)}
                          <span className="text-xs font-medium">
                            {vehicle.tee_secure}/{vehicle.tee_total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>See more</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Vehicle Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {selectedVehicle?.vehicle_id} - Vehicle Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this vehicle and its TEE security status
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                <div>
                  <p className="text-sm font-medium">Overall TEE Status</p>
                  <p className="text-xs text-muted-foreground mt-1">Current security state</p>
                </div>
                {getStatusBadge(selectedVehicle.tee_status)}
              </div>

              {/* Vehicle Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Vehicle ID</label>
                    <p className="text-sm font-semibold mt-1">{selectedVehicle.vehicle_id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Model</label>
                    <p className="text-sm mt-1">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </label>
                    <p className="text-sm mt-1">{selectedVehicle.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Last Update
                    </label>
                    <p className="text-sm mt-1">
                      {format(new Date(selectedVehicle.last_update), "PPpp")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(selectedVehicle.last_update), { addSuffix: true })}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Created</label>
                    <p className="text-sm mt-1">
                      {format(new Date(selectedVehicle.created_at), "PP")}
                    </p>
                  </div>
                </div>
              </div>

              {/* TEE Statistics */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  TEE Security Breakdown
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg border border-border bg-background">
                    <p className="text-xs text-muted-foreground">Total TEEs</p>
                    <p className="text-2xl font-bold mt-1">{selectedVehicle.tee_total}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-success/50 bg-success/5">
                    <p className="text-xs text-success">Secure</p>
                    <p className="text-2xl font-bold text-success mt-1">{selectedVehicle.tee_secure}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-warning/50 bg-warning/5">
                    <p className="text-xs text-warning">Warning</p>
                    <p className="text-2xl font-bold text-warning mt-1">{selectedVehicle.tee_warning}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-critical/50 bg-critical/5">
                    <p className="text-xs text-critical">Critical</p>
                    <p className="text-2xl font-bold text-critical mt-1">{selectedVehicle.tee_critical}</p>
                  </div>
                </div>
              </div>

              {/* Security Health Percentage */}
              <div className="p-4 rounded-lg border border-border bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Health</span>
                  <span className="text-sm font-bold">
                    {Math.round((selectedVehicle.tee_secure / selectedVehicle.tee_total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-all"
                    style={{ width: `${(selectedVehicle.tee_secure / selectedVehicle.tee_total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedVehicle.tee_secure} out of {selectedVehicle.tee_total} TEEs are operating securely
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};