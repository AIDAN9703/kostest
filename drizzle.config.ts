import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env.local' });

export default defineConfig({
  schema: "./database/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ['!spatial_ref_sys', '!topology', '!geography_columns', '!geometry_columns'],
  verbose: true,
});
