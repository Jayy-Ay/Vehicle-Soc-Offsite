import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import {
  buildLogQL,
  buildStructuredQueryFromText,
  executeLogQLFromText,
  executeStructuredLogQuery,
  LogQLParseError,
  type StructuredLogQuery,
} from './logql';

class MockQuery {
  calls: Array<{ method: string; args: unknown[] }> = [];
  rows: unknown[];

  constructor(rows: unknown[]) {
    this.rows = rows;
  }

  select(...args: unknown[]) {
    this.calls.push({ method: 'select', args });
    return this;
  }

  eq(...args: unknown[]) {
    this.calls.push({ method: 'eq', args });
    return this;
  }

  gte(...args: unknown[]) {
    this.calls.push({ method: 'gte', args });
    return this;
  }

  or(...args: unknown[]) {
    this.calls.push({ method: 'or', args });
    return this;
  }

  order(...args: unknown[]) {
    this.calls.push({ method: 'order', args });
    return this;
  }

  limit(...args: unknown[]) {
    this.calls.push({ method: 'limit', args });
    return this;
  }

  then<TResult1 = { data: unknown[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: unknown[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({ data: this.rows, error: null }).then(onfulfilled, onrejected);
  }
}

class MockSupabase {
  rows: unknown[];
  lastTable: string | null = null;
  lastQuery: MockQuery | null = null;

  constructor(rows: unknown[]) {
    this.rows = rows;
  }

  from(table: string) {
    this.lastTable = table;
    const query = new MockQuery(this.rows);
    this.lastQuery = query;
    return query as unknown as ReturnType<SupabaseClient<Database>['from']>;
  }
}

const buildStructured = (text: string, overrides: Partial<StructuredLogQuery> = {}) => ({
  ...buildStructuredQueryFromText(text),
  ...overrides,
});

describe('logql pipeline', () => {
  it('maps natural language to structured query and logql string', () => {
    const structured = buildStructuredQueryFromText(
      'show high alerts for vehicle VH-2847 last 24 hours containing boot errors',
    );

    expect(structured.source).toBe('alerts');
    expect(structured.labels.vehicle_id).toBe('VH-2847');
    expect(structured.labels.severity).toBe('high');
    expect(structured.rangeMinutes).toBe(24 * 60);
    expect(structured.searchTerms).toContain('boot');

    const { logql } = buildLogQL(structured);
    expect(logql).toContain('source="alerts"');
    expect(logql).toContain('vehicle_id="VH-2847"');
    expect(logql).toContain('severity="high"');
    expect(logql).toContain('|= "boot"');
  });

  it('throws for empty natural language input', () => {
    expect(() => buildStructuredQueryFromText('   ')).toThrow(LogQLParseError);
  });

  it('executes structured query through the supabase adapter', async () => {
    const mockRows = [
      {
        id: '1',
        alert_id: 'ALT-1',
        severity: 'high',
        title: 'Memory fault',
        description: 'Test log',
        vehicle_id: 'VH-1111',
        tee_id: 'TEE-01',
        status: 'pending',
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ] satisfies Database['public']['Tables']['alerts']['Row'][];

    const mockClient = new MockSupabase(mockRows);
    const structured = buildStructured('high alerts limit 5', { source: 'alerts', limit: 5 });

    const result = await executeStructuredLogQuery(structured, mockClient as unknown as SupabaseClient<Database>);

    expect(result.rows).toHaveLength(1);
    expect(result.logql).toContain('severity="high"');
    expect(mockClient.lastTable).toBe('alerts');
    expect(mockClient.lastQuery?.calls.find((call) => call.method === 'limit')?.args[0]).toBe(5);
  });

  it('executes text query end-to-end when a client is provided', async () => {
    const mockRows: Database['public']['Tables']['alerts']['Row'][] = [];
    const mockClient = new MockSupabase(mockRows);

    const result = await executeLogQLFromText(
      'benign alerts last 1 hour',
      'alerts',
      mockClient as unknown as SupabaseClient<Database>,
    );

    expect(result.rows).toEqual([]);
    expect(result.logql).toContain('benign');
    expect(mockClient.lastTable).toBe('alerts');
  });
});
