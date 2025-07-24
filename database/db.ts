import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import config from "@/shared/config/config";


const sql = neon(config.databaseUrl || "postgresql://neondb_owner:npg_iKwZ5FhId7LB@ep-old-wind-a43xretw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

export const db = drizzle({ client: sql });
