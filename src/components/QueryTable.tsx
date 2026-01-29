import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

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