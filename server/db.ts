
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../shared/schema';
import { users } from '../shared/schema';

// Disable WebSockets for HTTP-only deployment environments
neonConfig.fetchConnectionCache = true;

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('ERROR: Missing required DATABASE_URL environment variable for Neon database connection');
  console.error('Please set the DATABASE_URL environment variable in your deployment settings');
  process.exit(1);
}

// Initialize database connection
let sql;
try {
  sql = neon(process.env.DATABASE_URL);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  console.error('Please check your DATABASE_URL environment variable');
  process.exit(1);
}

export const db = drizzle(sql, { schema });

// Verify connection
db.select().from(users).limit(1).catch(error => {
  console.error('Database connection failed:', error);
  console.error('Please check your DATABASE_URL environment variable');
  process.exit(1);
});

console.log("Database connection initialized");
