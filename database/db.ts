import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import config from "@/shared/lib/config";
import * as schema from "./schema";

const sql = neon(config.databaseUrl);

export const db = drizzle({ client: sql, schema });
