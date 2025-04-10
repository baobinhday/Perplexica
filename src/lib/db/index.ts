import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'data/db.sqlite');
const sqlite = new Database(databaseUrl);
const db = drizzle(sqlite, {
  schema: schema,
});

export default db;
