import { createClient } from '@libsql/client';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function setup() {
  console.log('Setting up database...');

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      color TEXT DEFAULT '#a3e635',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS check_ins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      water INTEGER DEFAULT 0,
      protein INTEGER DEFAULT 0,
      eating INTEGER DEFAULT 0,
      workout INTEGER DEFAULT 0,
      cardio INTEGER DEFAULT 0,
      sleep INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    )
  `);

  // Add columns if they don't exist (for existing databases)
  try { await db.execute(`ALTER TABLE users ADD COLUMN display_name TEXT`); } catch {}
  try { await db.execute(`ALTER TABLE users ADD COLUMN color TEXT DEFAULT '#a3e635'`); } catch {}
  try { await db.execute(`ALTER TABLE check_ins ADD COLUMN eating INTEGER DEFAULT 0`); } catch {}

  console.log('Database setup complete!');
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
