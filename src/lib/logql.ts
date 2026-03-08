import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';

export type LogSource = 'alerts' | 'vehicles' | 'threat_metrics';

export interface StructuredLogQuery {
  source: LogSource;
  labels: Record<string, string>;
  searchTerms: string[];
  rangeMinutes?: number;
  limit?: number;
}

export interface LogQLBuildResult {
  logql: string;
  structured: StructuredLogQuery;
}

type TableRowMap = {
  alerts: Database['public']['Tables']['alerts']['Row'];
  vehicles: Database['public']['Tables']['vehicles']['Row'];
  threat_metrics: Database['public']['Tables']['threat_metrics']['Row'];
};

export class LogQLParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LogQLParseError';
  }
}

export class LogQLExecutionError extends Error {
  logql: string;

  constructor(message: string, logql: string) {
    super(message);
    this.name = 'LogQLExecutionError';
    this.logql = logql;
  }
}

const DEFAULT_LIMIT = 100;
const STOP_WORDS = new Set([
  'show',
  'list',
  'all',
  'logs',
  'log',
  'alerts',
  'alert',
  'vehicles',
  'vehicle',
  'for',
  'with',
  'in',
  'of',
  'the',
  'last',
  'past',
  'from',
  'recent',
  'please',
]);

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();

const escapeLabelValue = (value: string) => value.replace(/"/g, '\\"');

const pickSource = (text: string, fallback: LogSource): LogSource => {
  if (/alert|log/i.test(text)) return 'alerts';
  if (/vehicle/i.test(text)) return 'vehicles';
  if (/threat|metric/i.test(text)) return 'threat_metrics';
  return fallback;
};

const parseRangeMinutes = (text: string): number | undefined => {
  const match = text.match(/last\s+(\d+)\s*(minute|minutes|min|hour|hours|hr|day|days)/i);
  if (!match) return undefined;

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (Number.isNaN(value)) return undefined;

  if (unit.startsWith('day')) return value * 24 * 60;
  if (unit.startsWith('hour') || unit.startsWith('hr')) return value * 60;
  return value;
};

const parseLimit = (text: string): number | undefined => {
  const match = text.match(/(?:top|first|limit)\s+(\d+)/i);
  if (!match) return undefined;
  return Number(match[1]);
};

const parseSeverity = (text: string): { alertSeverity?: string; teeStatus?: string } => {
  const match = text.match(/\b(critical|high|medium|low|benign|warning|secure)\b/i);
  if (!match) return {};

  const value = match[1].toLowerCase();
  if (['critical', 'high', 'medium', 'low', 'benign'].includes(value)) {
    return { alertSeverity: value === 'critical' ? 'high' : value };
  }

  if (['warning', 'secure'].includes(value)) {
    return { teeStatus: value as 'warning' | 'secure' };
  }

  return {};
};

const parseStatus = (text: string): string | undefined => {
  const match = text.match(/\b(pending|investigating|resolved)\b/i);
  return match ? match[1].toLowerCase() : undefined;
};

const stripKnownTokens = (text: string, tokens: string[]) => {
  let updated = text;
  tokens.forEach((token) => {
    updated = updated.replace(token, ' ');
  });
  return normalizeWhitespace(updated);
};

export const buildStructuredQueryFromText = (text: string, fallbackSource: LogSource = 'alerts'): StructuredLogQuery => {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    throw new LogQLParseError('Query text cannot be empty');
  }

  const source = pickSource(normalized, fallbackSource);
  const labels: Record<string, string> = { source };

  const vehicleMatch = normalized.match(/(VH-\d{3,}|vehicle\s+#?\d+)/i);
  if (vehicleMatch) {
    labels.vehicle_id = vehicleMatch[1].toUpperCase();
  }

  const teeMatch = normalized.match(/(TEE-[A-Z0-9-]+)/i);
  if (teeMatch) {
    labels.tee_id = teeMatch[1].toUpperCase();
  }

  const { alertSeverity, teeStatus } = parseSeverity(normalized);
  if (alertSeverity) {
    labels.severity = alertSeverity;
  }
  if (teeStatus) {
    labels.tee_status = teeStatus;
  }

  const status = parseStatus(normalized);
  if (status) {
    labels.status = status;
  }

  const rangeMinutes = parseRangeMinutes(normalized);
  const limit = parseLimit(normalized) ?? DEFAULT_LIMIT;

  const tokensToStrip = [
    vehicleMatch?.[0] ?? '',
    teeMatch?.[0] ?? '',
    status ?? '',
    alertSeverity ?? '',
    teeStatus ?? '',
  ].filter(Boolean);

  const searchSpace = stripKnownTokens(normalized, tokensToStrip);

  const searchTerms = searchSpace
    .split(' ')
    .map((term) => term.trim())
    .filter((term) => term && !STOP_WORDS.has(term.toLowerCase()));

  return {
    source,
    labels,
    searchTerms,
    rangeMinutes,
    limit,
  };
};

export const buildLogQL = (structured: StructuredLogQuery): LogQLBuildResult => {
  const labelEntries = Object.entries({ source: structured.source, ...structured.labels });
  const selector = `{${labelEntries.map(([key, value]) => `${key}="${escapeLabelValue(value)}"`).join(',')}}`;
  const filters = structured.searchTerms.map((term) => `|= "${escapeLabelValue(term)}"`);
  const logql = [selector, ...filters].join(' ').trim();

  return { logql, structured };
};

type SupabaseFilter = ReturnType<ReturnType<SupabaseClient<Database>['from']>['select']>;

const applySearchFilters = (
  query: SupabaseFilter,
  columns: string[],
  searchTerms: string[],
): SupabaseFilter => {
  if (searchTerms.length === 0) return query;

  const orConditions = searchTerms
    .map((term) => columns.map((column) => `${column}.ilike.%${term}%`).join(','))
    .join(',');

  return query.or(orConditions);
};

const buildSupabaseQuery = (
  client: SupabaseClient<Database>,
  structured: StructuredLogQuery,
) => {
  const { source, labels, rangeMinutes, searchTerms, limit } = structured;
  const limitValue = limit ?? DEFAULT_LIMIT;

  if (source === 'alerts') {
    let query = client.from('alerts').select('*');
    if (labels.severity) query = query.eq('severity', labels.severity);
    if (labels.status) query = query.eq('status', labels.status);
    if (labels.vehicle_id) query = query.eq('vehicle_id', labels.vehicle_id);
    if (labels.tee_id) query = query.eq('tee_id', labels.tee_id);
    const columnsToSearch = ['title', 'description', 'vehicle_id', 'tee_id'];
    query = applySearchFilters(query, columnsToSearch, searchTerms);
    if (rangeMinutes) {
      const startTime = new Date(Date.now() - rangeMinutes * 60 * 1000).toISOString();
      query = query.gte('timestamp', startTime);
    }
    return query.order('timestamp', { ascending: false }).limit(limitValue);
  }

  if (source === 'vehicles') {
    let query = client.from('vehicles').select('*');
    if (labels.vehicle_id) query = query.eq('vehicle_id', labels.vehicle_id);
    if (labels.tee_status) query = query.eq('tee_status', labels.tee_status);
    const columnsToSearch = ['vehicle_id', 'model', 'location'];
    query = applySearchFilters(query, columnsToSearch, searchTerms);
    if (rangeMinutes) {
      const startTime = new Date(Date.now() - rangeMinutes * 60 * 1000).toISOString();
      query = query.gte('last_update', startTime);
    }
    return query.order('last_update', { ascending: false }).limit(limitValue);
  }

  let query = client.from('threat_metrics').select('*');
  if (rangeMinutes) {
    const startTime = new Date(Date.now() - rangeMinutes * 60 * 1000).toISOString();
    query = query.gte('timestamp', startTime);
  }
  return query.order('timestamp', { ascending: false }).limit(limitValue);
};

// Supabase does not speak LogQL directly, so we translate the structured query into PostgREST filters
// while returning the LogQL string for observability/debugging.
export const executeStructuredLogQuery = async <TSource extends LogSource>(
  structured: StructuredLogQuery,
  client: SupabaseClient<Database> = supabase,
): Promise<{ logql: string; structured: StructuredLogQuery; rows: TableRowMap[TSource][] }> => {
  const { logql } = buildLogQL(structured);

  const query = buildSupabaseQuery(client, structured);
  const { data, error } = await query;

  if (error) {
    throw new LogQLExecutionError(error.message, logql);
  }

  return {
    logql,
    structured,
    rows: (data ?? []) as TableRowMap[TSource][],
  };
};

export const executeLogQLFromText = async (
  text: string,
  fallbackSource: LogSource = 'alerts',
  client: SupabaseClient<Database> = supabase,
) => {
  const structured = buildStructuredQueryFromText(text, fallbackSource);
  return executeStructuredLogQuery(structured, client);
};
