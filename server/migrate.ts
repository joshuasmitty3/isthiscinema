
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

const runMigrate = async () => {
  const connection = postgres(process.env.DATABASE_URL!);
  const db = drizzle(connection);

  console.log("Running migrations...");
  
  await migrate(db, { migrationsFolder: "migrations" });
  
  console.log("Migrations complete!");
  
  await connection.end();
};

runMigrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
