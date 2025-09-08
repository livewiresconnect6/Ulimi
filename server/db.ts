import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

// Configure neon to use fetch
neonConfig.fetchConnectionCache = true;

const sql = neon(process.env.DATABASE_URL, {
  fullResults: true,
  arrayMode: false,
});

export const db = drizzle(sql, { schema });