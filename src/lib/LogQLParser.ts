import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Alert = Database["public"]["Tables"]["alerts"]["Row"];
type Threats = Database["public"]["Tables"]["threat_metrics"]["Row"];

export type TableName = "vehicles" | "alerts" | "threat_metrics";

export type ComparisonOperator =
  | "eq"
  | "neq"
  | "contains"
  | "regex"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export type QueryFilter = {
  field: string;
  operator: ComparisonOperator;
  value: string | number;
};

export type QueryIntent = {
  table: TableName;
  filters: QueryFilter[];
  limit?: number;
  timeRangeMinutes?: number;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  };
};

export type LogQLQuery = {
  logql: string;
  intent: QueryIntent;
  table: TableName;
};

export type LogQLExecutionResult<TData = Vehicle | Alert | Threats> = LogQLQuery & {
  data: TData[];
};

type SupabaseQuery = ReturnType<SupabaseClient<Database>["from"]>;

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
  "last_update",
]);

const ALERTS_ALLOWED_FIELDS = new Set<keyof Alert>([
  "alert_id",
  "severity",
  "title",
  "description",
  "vehicle_id",
  "tee_id",
  "status",
  "created_at",
  "updated_at",
  "timestamp",
]);

const THREATS_ALLOWED_FIELDS = new Set<keyof Threats>([
  "timestamp",
  "critical_count",
  "warning_count",
  "info_count",
  "created_at",
]);

const ALLOWED_FIELDS_BY_TABLE: Record<TableName, Set<string>> = {
  vehicles: new Set([...VEHICLES_ALLOWED_FIELDS] as string[]),
  alerts: new Set([...ALERTS_ALLOWED_FIELDS] as string[]),
  threat_metrics: new Set([...THREATS_ALLOWED_FIELDS] as string[]),
};

const TABLE_CONFIG: Record<
  TableName,
  {
    allowedFields: Set<string>;
    defaultOrder: string;
    timeField: string;
  }
> = {
  vehicles: {
    allowedFields: ALLOWED_FIELDS_BY_TABLE.vehicles,
    defaultOrder: "last_update",
    timeField: "last_update",
  },
  alerts: {
    allowedFields: ALLOWED_FIELDS_BY_TABLE.alerts,
    defaultOrder: "timestamp",
    timeField: "timestamp",
  },
  threat_metrics: {
    allowedFields: ALLOWED_FIELDS_BY_TABLE.threat_metrics,
    defaultOrder: "timestamp",
    timeField: "timestamp",
  },
};

const DEFAULT_LIMIT = 100;

const TABLE_KEYWORDS: Record<TableName, RegExp> = {
  vehicles: /\bvehicle(s)?\b/i,
  alerts: /\balert(s)?\b/i,
  threat_metrics: /\b(threat|metric)(s)?\b/i,
};

function escapeLabelValue(value: string | number) {
  return String(value).replace(/"/g, '\\"');
}

function ensureFieldAllowed(table: TableName, field: string) {
  if (!TABLE_CONFIG[table].allowedFields.has(field)) {
    throw new Error(
      `Unknown field "${field}" for ${table}. Allowed: ${[
        ...TABLE_CONFIG[table].allowedFields,
      ].join(", ")}`
    );
  }
}

function detectTableFromInput(input: string): TableName {
  const firstWord = input.trim().split(/\s+/)[0]?.toLowerCase();
  if (firstWord && Object.keys(TABLE_CONFIG).includes(firstWord)) {
    return firstWord as TableName;
  }

  for (const [table, pattern] of Object.entries(TABLE_KEYWORDS)) {
    if (pattern.test(input)) return table as TableName;
  }

  return "vehicles";
}

function extractLimit(input: string): number | undefined {
  const limitMatch = input.match(/\blimit\s+(\d+)\b/i);
  if (!limitMatch) return undefined;
  const parsed = Number.parseInt(limitMatch[1], 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function extractTimeRangeMinutes(input: string): number | undefined {
  const rangeMatch = input.match(
    /\b(last|past)\s+(\d+)\s+(minute|minutes|hour|hours|day|days)\b/i
  );

  if (!rangeMatch) return undefined;

  const amount = Number.parseInt(rangeMatch[2], 10);
  const unit = rangeMatch[3].toLowerCase();

  if (!Number.isFinite(amount) || amount <= 0) return undefined;

  switch (unit) {
    case "minute":
    case "minutes":
      return amount;
    case "hour":
    case "hours":
      return amount * 60;
    case "day":
    case "days":
      return amount * 60 * 24;
    default:
      return undefined;
  }
}

function formatDuration(minutes?: number): string | undefined {
  if (!minutes) return undefined;
  if (minutes % (60 * 24) === 0) return `${minutes / (60 * 24)}d`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes}m`;
}

function normalizeContainsValue(value: string) {
  return value.replace(/(^["']|["']$)/g, "").trim();
}

function maybeAddFilter(
  filters: QueryFilter[],
  field: string,
  operator: ComparisonOperator,
  value?: string | number
) {
  if (value === undefined || value === null || value === "") return;
  filters.push({ field, operator, value });
}

function parseDirectTriplet(
  input: string
): { table?: TableName; filter?: QueryFilter } {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 3) return {};

  const [possibleTable, possibleField, ...rest] = parts;
  const limitIndex = rest.findIndex((segment) => segment.toLowerCase() === "limit");
  const valueParts = limitIndex === -1 ? rest : rest.slice(0, limitIndex);
  const possibleValue = valueParts.join(" ");

  if (!possibleTable || !possibleField || !possibleValue) return {};

  if (Object.keys(TABLE_CONFIG).includes(possibleTable)) {
    const table = possibleTable as TableName;
    if (TABLE_CONFIG[table].allowedFields.has(possibleField)) {
      return {
        table,
        filter: {
          field: possibleField,
          operator: "eq",
          value: possibleValue.trim(),
        },
      };
    }
  }

  return {};
}

export function parseTextToIntent(input: string): QueryIntent {
  const text = input.trim();
  if (!text) {
    throw new Error("Query cannot be empty");
  }

  const direct = parseDirectTriplet(text);
  let table = direct.table ?? detectTableFromInput(text);

  const filters: QueryFilter[] = [];

  if (direct.filter) {
    filters.push(direct.filter);
  }

  const lower = text.toLowerCase();

  const severityMatch = lower.match(
    /\bseverity\s+(high|medium|low|benign)\b/i
  );
  if (severityMatch) {
    maybeAddFilter(filters, "severity", "eq", severityMatch[1].toLowerCase());
    table = "alerts";
  }

  const statusMatch = lower.match(/\bstatus\s+(pending|investigating|resolved)\b/i);
  if (statusMatch) {
    maybeAddFilter(filters, "status", "eq", statusMatch[1].toLowerCase());
    table = "alerts";
  }

  const teeStatusMatch = lower.match(
    /\btee[_\s-]?status\s+(secure|warning|critical)\b/i
  );
  if (teeStatusMatch) {
    maybeAddFilter(
      filters,
      "tee_status",
      "eq",
      teeStatusMatch[1].toLowerCase()
    );
    table = "vehicles";
  }

  const vehicleMatch = text.match(/\bvehicle[_\s-]?id?\s+([A-Za-z0-9_-]+)\b/i);
  if (vehicleMatch) {
    maybeAddFilter(filters, "vehicle_id", "eq", vehicleMatch[1]);
    if (table === "threat_metrics") {
      table = "alerts";
    }
  }

  const locationMatch = text.match(/\b(in|at)\s+([A-Za-z\s,]+)\b/i);
  if (locationMatch) {
    maybeAddFilter(
      filters,
      "location",
      "contains",
      normalizeContainsValue(locationMatch[2])
    );
    table = "vehicles";
  }

  const modelMatch = text.match(/\bmodel\s+([A-Za-z0-9\-_]+)/i);
  if (modelMatch) {
    maybeAddFilter(filters, "model", "contains", modelMatch[1]);
    table = "vehicles";
  }

  const timeRangeMinutes = extractTimeRangeMinutes(text);
  const limit = extractLimit(text) ?? DEFAULT_LIMIT;

  filters.forEach((filter) => ensureFieldAllowed(table, filter.field));

  return {
    table,
    filters,
    timeRangeMinutes,
    limit,
    orderBy: {
      field: TABLE_CONFIG[table].defaultOrder,
      direction: "desc",
    },
  };
}

export function buildLogQL(intent: QueryIntent): LogQLQuery {
  const labels = [
    `table="${intent.table}"`,
    ...intent.filters.map((filter) => {
      const value = escapeLabelValue(filter.value);
      switch (filter.operator) {
        case "neq":
          return `${filter.field}!="${value}"`;
        case "contains":
        case "regex":
          return `${filter.field}=~".*${value}.*"`;
        default:
          return `${filter.field}="${value}"`;
      }
    }),
  ];

  const rangeWindow = formatDuration(intent.timeRangeMinutes);
  const selector = `{${labels.join(",")}}${rangeWindow ? `[${rangeWindow}]` : ""}`;

  return {
    logql: `${selector} | json`,
    intent,
    table: intent.table,
  };
}

function applyFilterToQuery(
  query: SupabaseQuery,
  filter: QueryFilter
) {
  switch (filter.operator) {
    case "eq":
      return query.eq(filter.field, filter.value);
    case "neq":
      return query.neq(filter.field, filter.value);
    case "contains":
    case "regex":
      return query.ilike(filter.field, `%${filter.value}%`);
    case "gt":
      return query.gt(filter.field, filter.value);
    case "gte":
      return query.gte(filter.field, filter.value);
    case "lt":
      return query.lt(filter.field, filter.value);
    case "lte":
      return query.lte(filter.field, filter.value);
    default:
      return query;
  }
}

export async function executeLogQL(
  supabase: SupabaseClient<Database>,
  intent: QueryIntent
): Promise<LogQLExecutionResult> {
  const { table } = intent;
  const config = TABLE_CONFIG[table];

  let query = supabase.from(table).select("*");

  intent.filters.forEach((filter) => {
    query = applyFilterToQuery(query, filter);
  });

  if (intent.timeRangeMinutes) {
    const cutoff = new Date(
      Date.now() - intent.timeRangeMinutes * 60 * 1000
    ).toISOString();
    query = query.gte(config.timeField, cutoff);
  }

  if (intent.orderBy?.field) {
    query = query.order(intent.orderBy.field, {
      ascending: intent.orderBy.direction === "asc",
    });
  }

  if (intent.limit) {
    query = query.limit(intent.limit);
  }

  const { data, error } = await query;

  if (error) throw error;

  const logqlQuery = buildLogQL(intent);

  return {
    ...logqlQuery,
    data: (data ?? []) as (Vehicle | Alert | Threats)[],
  };
}

export async function runLogQLPipeline(
  supabase: SupabaseClient<Database>,
  input: string
): Promise<LogQLExecutionResult> {
  const intent = parseTextToIntent(input);
  return executeLogQL(supabase, intent);
}
