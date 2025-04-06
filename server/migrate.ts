
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// For migrations
const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
const db = drizzle(migrationClient);

// Create tables based on schema
async function main() {
  console.log('Creating tables...');
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS movies (
      id SERIAL PRIMARY KEY,
      imdb_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      year TEXT NOT NULL,
      director TEXT NOT NULL,
      poster TEXT NOT NULL,
      plot TEXT NOT NULL,
      runtime TEXT,
      genre TEXT,
      actors TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS watch_list (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      "order" INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS watched_list (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      movie_id INTEGER NOT NULL,
      watched_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      review TEXT,
      rating INTEGER
    )`
  ];

  for (const query of queries) {
    await migrationClient.query(query);
  }
  
  console.log('Tables created successfully');
  await migrationClient.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
