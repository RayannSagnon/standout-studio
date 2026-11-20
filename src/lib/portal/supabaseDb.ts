// The Db interface on top of Supabase. With the service key it is the trusted
// store; with a signed-in user's session, row-level security filters every read.

import type { SupabaseClient } from "@supabase/supabase-js";
import { NotFoundError, type Db } from "./db.ts";

export function supabaseDb(sb: SupabaseClient): Db {
  const fail = (error: { message: string } | null) => {
    if (error) throw new Error(`supabase: ${error.message}`);
  };

  return {
    async list(table, where = {}, opts) {
      let q = sb.from(table).select("*");
      for (const [k, v] of Object.entries(where)) {
        if (Array.isArray(v)) q = q.in(k, v as unknown[]);
        else if (v === null) q = q.is(k, null);
        else q = q.eq(k, v as never);
      }
      if (opts?.order) q = q.order(opts.order[0], { ascending: opts.order[1] === "asc", nullsFirst: false });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data, error } = await q;
      fail(error);
      return (data ?? []) as never;
    },
    async get(table, id) {
      const { data, error } = await sb.from(table).select("*").eq("id", id).maybeSingle();
      fail(error);
      return (data ?? null) as never;
    },
    async insert(table, row) {
      const { data, error } = await sb.from(table).insert(row as never).select("*").single();
      fail(error);
      return data as never;
    },
    async update(table, id, patch) {
      const { data, error } = await sb.from(table).update(patch as never).eq("id", id).select("*").maybeSingle();
      fail(error);
      if (!data) throw new NotFoundError();
      return data as never;
    },
  };
}
