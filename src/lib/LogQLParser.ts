import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from '@/lib/database.types'

type Vehicle = Database['public']['Tables']['vehicles']['Row'];

const ALLOWED_FIELDS = new Set<keyof Vehicle>([
  "vehicle_id",
  "model",
  "location",
  "tee_status",
  "tee_total",
  "tee_secure",
  "tee_warning",
  "tee_critical",
])

function validateQuery(input: string): { field: string; value: string } {
  const text = input.trim()
  const firstSpace = text.indexOf(" ")

  const field = text.slice(0, firstSpace).trim()
  const value = text.slice(firstSpace + 1).trim()

  if (!field || !value) {
    throw new Error('Invalid query. Use: field value (e.g. tee_status severe)')
  }
  return { field, value }
}

export async function parseLogQL(
  supabase: SupabaseClient<Database>,
  input: string,
) {
  console.log(input);
  const { field, value } = validateQuery(input)

  console.log(field);
  console.log(value);

  if (!ALLOWED_FIELDS.has(field as keyof Vehicle)) {
    throw new Error(`Unknown field "${field}". Allowed: ${[...ALLOWED_FIELDS].join(", ")}`)
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq(field as string, value)
    .order("last_update", { ascending: false })

  if (error) throw error
  return data as Vehicle[]
}