
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { users } from '../shared/schema';

// Disable WebSockets for HTTP-only deployment environments
neonConfig.fetchConnectionCache = true;

// Initialize database connection
const sql = neon(process.env.DATABASE_URL || '');
export const db = drizzle(sql, { schema });

// Verify connection
db.select().from(users).limit(1).catch(error => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

console.log("Database connection initialized");
