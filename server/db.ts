
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Disable WebSockets for HTTP-only deployment environments
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  process.exit(1);
}

try {
  const sql = neon(process.env.DATABASE_URL);
  export const db = drizzle(sql, { schema });
  console.log("Database connection initialized successfully");
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
}
