import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from '@/lib/database.types'

type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Alert = Database['public']['Tables']['alerts']['Row'];
type Threats = Database['public']['Tables']['threat_metrics']['Row'];

export type TableName = "vehicles" | "alerts" | "threat_metrics"

const VEHICLES_ALLOWED_FIELDS = new Set<keyof Vehicle>([
  "vehicle_id",
  "model",
  "location",
  "tee_status",
  "tee_total",
  "tee_secure",
  "tee_warning",
  "tee_critical",
  "created_at",
])

const ALERTS_ALLOWED_FIELDS = new Set<keyof Alert>([
  "alert_id",
  "severity",
  "title",
  "description",
  "vehicle_id",
  "tee_id",
  "status",
  "created_at",
])

const THREATS_ALLOWED_FIELDS = new Set<keyof Threats>([
  "timestamp",
  "critical_count",
  "warning_count",
  "info_count",
  "created_at",
])

const ALLOWED_FIELDS_BY_TABLE: Record<string, Set<string>> = {
  vehicles: new Set([...VEHICLES_ALLOWED_FIELDS] as string[]),
  alerts: new Set([...ALERTS_ALLOWED_FIELDS] as string[]),
  threat_metrics: new Set([...THREATS_ALLOWED_FIELDS] as string[]),
}

const ORDER_BY: Record<string, string> = {
  vehicles: "last_update",
  alerts: "updated_at",
  threats_metrics: "timestamp",
}

function validateQuery(input: string): { table: string; field: string; value: string } {
  const text = input.trim()
  const firstSpace = text.indexOf(" ")
  const secondSpace = text.indexOf(" ", firstSpace + 1);

  const tableRaw = text.slice(0, firstSpace).trim();
  const field = text.slice(firstSpace + 1, secondSpace).trim();
  const value = text.slice(secondSpace + 1).trim();

  if (!tableRaw || !field || !value) {
    throw new Error('Invalid query. Use: field value (e.g. vehicles tee_status severe)')
  }
  return { table: tableRaw, field, value }
}

export async function parseLogQL(
  supabase: SupabaseClient<Database>,
  input: string,
) {
  //console.log(input);
  const { table, field, value } = validateQuery(input)

  //console.log(field);
  //console.log(value);
  const allowedFields = ALLOWED_FIELDS_BY_TABLE[table]

  if (!allowedFields) {
    throw new Error(`Unknown table "${table}". Allowed: ${Object.keys(ALLOWED_FIELDS_BY_TABLE).join(", ")}`)
  }

  if (!allowedFields.has(field)) {
    throw new Error(`Unknown field "${field}" for ${table}. Allowed: ${[...allowedFields].join(", ")}`)
  }

  const { data, error } = await supabase
    .from(table as string)
    .select("*")
    .eq(field as string, value)
    .order(ORDER_BY[table] ?? "created_at", { ascending: false })

  if (error) throw error

  return {
    table,
    data: data ?? []
  }
}