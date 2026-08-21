import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";

const which = process.argv[2];
const url = which === "prod" ? process.env.PROD_DATABASE_URL : process.env.DATABASE_URL;
if (!url) throw new Error("missing url for " + which);
const sql = neon(url);

// Preview first: how many rows, and before/after deltas.
const preview = await sql`
  WITH sums AS (
    SELECT booking_id, SUM(amount_cents)::bigint AS total_cents
    FROM booking_expense_line GROUP BY booking_id
  )
  SELECT o.booking_id, o.expense_cents AS old_expense, s.total_cents AS new_expense,
         o.revenue_cents AS old_revenue
  FROM booking_ops o JOIN sums s ON s.booking_id = o.booking_id
  ORDER BY (s.total_cents - COALESCE(o.expense_cents,0)) DESC`;
console.log(`[${which}] bookings with expense lines:`, preview.length);
const changed = preview.filter(r => Number(r.old_expense ?? 0) !== Number(r.new_expense));
console.log(`[${which}] rows whose expense total changes:`, changed.length);
for (const r of changed.slice(0, 10))
  console.log(`  ${r.booking_id.slice(0,8)} expense ${r.old_expense} -> ${r.new_expense} (rev was ${r.old_revenue})`);

const stmt = readFileSync("scripts/backfill-expense-totals.sql", "utf8");
const updated = await sql(stmt);
console.log(`[${which}] updated rows:`, updated.length);
for (const r of updated.slice(0, 10))
  console.log(`  ${r.booking_id.slice(0,8)} expense=${r.expense_cents} revenue=${r.revenue_cents}`);
