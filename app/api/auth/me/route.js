import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Fetch display_name from DB
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT display_name FROM users WHERE id = ?',
    args: [user.userId],
  });

  const displayName = result.rows.length > 0 && result.rows[0].display_name
    ? result.rows[0].display_name
    : user.username;

  return NextResponse.json({
    user: { id: user.userId, username: user.username, display_name: displayName },
  });
}
