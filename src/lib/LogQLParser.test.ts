import { describe, expect, it } from "vitest";
import { buildLogQL, executeLogQL, parseTextToIntent } from "./LogQLParser";

class FakeQueryBuilder<T extends Record<string, unknown>> {
  private rows: T[];

  constructor(rows: T[]) {
    this.rows = [...rows];
  }

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[field as keyof T] === value);
    return this;
  }

  neq(field: string, value: unknown) {
    this.rows = this.rows.filter((row) => row[field as keyof T] !== value);
    return this;
  }

  ilike(field: string, pattern: string) {
    const regex = new RegExp(pattern.replace(/%/g, ".*"), "i");
    this.rows = this.rows.filter((row) => regex.test(String(row[field as keyof T] ?? "")));
    return this;
  }

  gt(field: string, value: unknown) {
    this.rows = this.rows.filter((row) => (row[field as keyof T] as number) > (value as number));
    return this;
  }

  gte(field: string, value: unknown) {
    this.rows = this.rows.filter(
      (row) => new Date(row[field as keyof T] as string) >= new Date(value as string)
    );
    return this;
  }

  lt(field: string, value: unknown) {
    this.rows = this.rows.filter((row) => (row[field as keyof T] as number) < (value as number));
    return this;
  }

  lte(field: string, value: unknown) {
    this.rows = this.rows.filter(
      (row) => new Date(row[field as keyof T] as string) <= new Date(value as string)
    );
    return this;
  }

  order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.rows = this.rows.sort((a, b) => {
      const left = a[field];
      const right = b[field];
      if (left === right) return 0;
      return ascending ? (left > right ? 1 : -1) : left > right ? -1 : 1;
    });
    return this;
  }

  limit(count: number) {
    this.rows = this.rows.slice(0, count);
    return this;
  }

  then<TResult1 = { data: T[]; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T[]; error: null }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ) {
    return Promise.resolve({ data: this.rows, error: null }).then(onfulfilled, onrejected);
  }
}

class FakeSupabaseClient {
  constructor(private readonly fixtures: Record<string, Record<string, unknown>[]>) {}

  from(table: string) {
    const rows = this.fixtures[table] ? [...this.fixtures[table]] : [];
    return new FakeQueryBuilder(rows);
  }
}

describe("parseTextToIntent and buildLogQL", () => {
  it("creates a LogQL selector for alerts with severity and time window", () => {
    const intent = parseTextToIntent("alerts severity high last 2 hours");
    const { logql } = buildLogQL(intent);

    expect(intent.table).toBe("alerts");
    expect(logql).toContain('table="alerts"');
    expect(logql).toContain('severity="high"');
    expect(logql).toContain("[2h]");
  });

  it("supports contains filters for vehicles", () => {
    const intent = parseTextToIntent("vehicles in San Francisco tee_status critical limit 5");
    const { logql } = buildLogQL(intent);

    expect(intent.table).toBe("vehicles");
    expect(logql).toContain('location=~".*San Francisco.*"');
    expect(intent.limit).toBe(5);
  });
});

describe("executeLogQL", () => {
  it("filters Supabase data using the generated intent", async () => {
    const fixtures = {
      vehicles: [
        {
          id: "1",
          vehicle_id: "VH-1",
          model: "Model S",
          location: "San Francisco, CA",
          tee_status: "critical",
          tee_total: 8,
          tee_secure: 6,
          tee_warning: 1,
          tee_critical: 1,
          last_update: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "2",
          vehicle_id: "VH-2",
          model: "Model 3",
          location: "Austin, TX",
          tee_status: "secure",
          tee_total: 6,
          tee_secure: 6,
          tee_warning: 0,
          tee_critical: 0,
          last_update: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    };

    const supabase = new FakeSupabaseClient(fixtures);
    const intent = parseTextToIntent("vehicles tee_status critical limit 1");
    const execution = await executeLogQL(
      supabase as unknown as SupabaseClient<Database>,
      intent
    );

    expect(execution.data).toHaveLength(1);
    expect(execution.data[0].vehicle_id).toBe("VH-1");
    expect(execution.logql).toContain('tee_status="critical"');
  });

  it("throws for empty input", () => {
    expect(() => parseTextToIntent("")).toThrow();
  });
});
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
