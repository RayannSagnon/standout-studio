// The one interface the business logic uses to read and write.
// Two implementations: memory (demo mode and tests) and Supabase.

import type { TableName, Tables } from "./types.ts";

export type Where<T> = { [K in keyof T]?: T[K] | T[K][] };
export type ListOptions<T> = { order?: [keyof T & string, "asc" | "desc"]; limit?: number };

export interface Db {
  list<N extends TableName>(table: N, where?: Where<Tables[N]>, opts?: ListOptions<Tables[N]>): Promise<Tables[N][]>;
  get<N extends TableName>(table: N, id: string): Promise<Tables[N] | null>;
  insert<N extends TableName>(table: N, row: Partial<Tables[N]>): Promise<Tables[N]>;
  update<N extends TableName>(table: N, id: string, patch: Partial<Tables[N]>): Promise<Tables[N]>;
}

export class NotFoundError extends Error {
  constructor(what = "not_found") {
    super(what);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("forbidden");
    this.name = "ForbiddenError";
  }
}

export class InputError extends Error {
  field: string;
  constructor(field: string) {
    super(`invalid_${field}`);
    this.name = "InputError";
    this.field = field;
  }
}

const matches = (row: Record<string, unknown>, where: Record<string, unknown> = {}) =>
  Object.entries(where).every(([k, v]) => (Array.isArray(v) ? v.includes(row[k]) : row[k] === v));

/** In-memory tables. Rows are copied in and out so callers cannot mutate the store by accident. */
export function memoryDb(seed: Partial<{ [N in TableName]: Tables[N][] }> = {}): Db & { dump(): typeof seed } {
  const data: { [N in TableName]?: Tables[N][] } = structuredClone(seed);
  const rows = <N extends TableName>(t: N) => (data[t] ??= []) as Tables[N][];
  const copy = <T>(x: T): T => structuredClone(x);

  return {
    async list(table, where, opts) {
      let out = rows(table).filter((r) => matches(r as Record<string, unknown>, where as Record<string, unknown>));
      if (opts?.order) {
        const [col, dir] = opts.order;
        out = [...out].sort((a, b) => {
          const x = a[col as keyof typeof a] as unknown as string | number;
          const y = b[col as keyof typeof b] as unknown as string | number;
          return (x < y ? -1 : x > y ? 1 : 0) * (dir === "asc" ? 1 : -1);
        });
      }
      if (opts?.limit) out = out.slice(0, opts.limit);
      return copy(out);
    },
    async get(table, id) {
      const r = rows(table).find((x) => (x as { id: string }).id === id);
      return r ? copy(r) : null;
    },
    async insert(table, row) {
      const full = { id: crypto.randomUUID(), ...copy(row) } as Tables[typeof table];
      rows(table).push(full);
      return copy(full);
    },
    async update(table, id, patch) {
      const list = rows(table);
      const i = list.findIndex((x) => (x as { id: string }).id === id);
      if (i < 0) throw new NotFoundError();
      list[i] = { ...list[i], ...copy(patch) };
      return copy(list[i]);
    },
    dump() {
      return copy(data);
    },
  };
}
