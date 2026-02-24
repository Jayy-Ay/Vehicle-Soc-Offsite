import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type Threats = Database['public']['Tables']['threat_metrics']['Row'];

export function VehiclesTable({ vehicles } : { vehicles: Vehicle[] }) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Total TEE</TableHead>
            <TableHead>Secure TEE</TableHead>
            <TableHead>Warning TEE</TableHead>
            <TableHead>Critical TEE</TableHead>
            <TableHead>Last update</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.vehicle_id}</TableCell>
              <TableCell>{v.model ?? "-"}</TableCell>
              <TableCell>{v.tee_status ?? "-"}</TableCell>
              <TableCell>{v.location ?? "-"}</TableCell>
              <TableCell>{v.tee_total ?? "-"}</TableCell>
              <TableCell>{v.tee_secure ?? "-"}</TableCell>
              <TableCell>{v.tee_warning ?? "-"}</TableCell>
              <TableCell>{v.tee_critical ?? "-"}</TableCell>
              <TableCell>
                {v.last_update ? new Date(v.last_update).toLocaleString() : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AlertsTable({ alerts } : { alerts: Alert[] }) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Vehicle ID</TableHead>
            <TableHead>TEE ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last update</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {alerts.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.alert_id}</TableCell>
              <TableCell>{v.severity ?? "-"}</TableCell>
              <TableCell>{v.title ?? "-"}</TableCell>
              <TableCell>{v.description ?? "-"}</TableCell>
              <TableCell>{v.vehicle_id ?? "-"}</TableCell>
              <TableCell>{v.tee_id ?? "-"}</TableCell>
              <TableCell>{v.status ?? "-"}</TableCell>
              <TableCell>
                {v.updated_at ? new Date(v.updated_at).toLocaleString() : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ThreatsTable({ threats } : { threats: Threats[] }) {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>Critical Count</TableHead>
            <TableHead>Warning Count</TableHead>
            <TableHead>INFO Count</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {threats.map((v) => (
            <TableRow key={v.id}>
              <TableCell>{v.critical_count}</TableCell>
              <TableCell>{v.warning_count ?? "-"}</TableCell>
              <TableCell>{v.info_count ?? "-"}</TableCell>
              <TableCell>
                {v.timestamp ? new Date(v.timestamp).toLocaleString() : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}