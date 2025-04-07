
import { defineConfig } from "drizzle-kit";

// Only log warning in development, deployment has DATABASE_URL set
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  console.warn("WARNING: DATABASE_URL not set. Database migrations may fail.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
