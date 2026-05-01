import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const db = getDb();

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name TEXT,
        color TEXT DEFAULT '#a3e635',
        dob TEXT,
        height_cm REAL,
        gender TEXT,
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

    // Add columns to existing tables if they don't exist
    try { await db.execute(`ALTER TABLE users ADD COLUMN display_name TEXT`); } catch {}
    try { await db.execute(`ALTER TABLE users ADD COLUMN color TEXT DEFAULT '#a3e635'`); } catch {}
    try { await db.execute(`ALTER TABLE users ADD COLUMN dob TEXT`); } catch {}
    try { await db.execute(`ALTER TABLE users ADD COLUMN height_cm REAL`); } catch {}
    try { await db.execute(`ALTER TABLE users ADD COLUMN gender TEXT`); } catch {}
    try { await db.execute(`ALTER TABLE check_ins ADD COLUMN eating INTEGER DEFAULT 0`); } catch {}

    return NextResponse.json({ success: true, message: 'Database tables created/updated!' });
  } catch (err) {
    console.error('Setup error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
