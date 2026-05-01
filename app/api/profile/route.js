import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 6 root colors with light and dark variants (12 total)
const ALLOWED_COLORS = [
  { value: '#60a5fa', label: 'Blue Light' },
  { value: '#2563eb', label: 'Blue Dark' },
  { value: '#f87171', label: 'Red Light' },
  { value: '#dc2626', label: 'Red Dark' },
  { value: '#a3e635', label: 'Lime Light' },
  { value: '#65a30d', label: 'Lime Dark' },
  { value: '#c084fc', label: 'Purple Light' },
  { value: '#9333ea', label: 'Purple Dark' },
  { value: '#fb923c', label: 'Orange Light' },
  { value: '#ea580c', label: 'Orange Dark' },
  { value: '#22d3ee', label: 'Cyan Light' },
  { value: '#0891b2', label: 'Cyan Dark' },
];

const ALLOWED_VALUES = ALLOWED_COLORS.map(c => c.value);

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  const result = await db.execute({
    sql: 'SELECT id, username, display_name, color, dob, height_cm, gender FROM users WHERE id = ?',
    args: [user.userId],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get all colors currently taken by OTHER users
  const takenResult = await db.execute({
    sql: 'SELECT color FROM users WHERE id != ? AND color IS NOT NULL',
    args: [user.userId],
  });
  const takenColors = takenResult.rows.map(r => r.color);

  const row = result.rows[0];
  return NextResponse.json({
    profile: {
      id: row.id,
      username: row.username,
      display_name: row.display_name || row.username,
      color: row.color || '#a3e635',
      dob: row.dob || null,
      height_cm: row.height_cm || null,
      gender: row.gender || null,
    },
    allowed_colors: ALLOWED_COLORS,
    taken_colors: takenColors,
  });
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { display_name, color, dob, height_cm, gender } = await request.json();
    const db = getDb();

    if (display_name !== undefined) {
      const name = display_name.trim();
      if (name.length < 1 || name.length > 20) {
        return NextResponse.json({ error: 'Display name must be 1-20 characters' }, { status: 400 });
      }
      await db.execute({
        sql: 'UPDATE users SET display_name = ? WHERE id = ?',
        args: [name, user.userId],
      });
    }

    if (dob !== undefined) {
      await db.execute({
        sql: 'UPDATE users SET dob = ? WHERE id = ?',
        args: [dob, user.userId],
      });
    }

    if (height_cm !== undefined) {
      const h = parseFloat(height_cm);
      if (isNaN(h) || h < 50 || h > 275) {
        return NextResponse.json({ error: 'Height must be between 50 and 275 cm' }, { status: 400 });
      }
      await db.execute({
        sql: 'UPDATE users SET height_cm = ? WHERE id = ?',
        args: [h, user.userId],
      });
    }

    if (gender !== undefined) {
      if (!['male', 'female'].includes(gender)) {
        return NextResponse.json({ error: 'Invalid gender' }, { status: 400 });
      }
      await db.execute({
        sql: 'UPDATE users SET gender = ? WHERE id = ?',
        args: [gender, user.userId],
      });
    }

    if (color !== undefined) {
      if (!ALLOWED_VALUES.includes(color)) {
        return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
      }

      // Check if color is taken by another user
      const taken = await db.execute({
        sql: 'SELECT id FROM users WHERE color = ? AND id != ?',
        args: [color, user.userId],
      });

      if (taken.rows.length > 0) {
        return NextResponse.json({ error: 'That color is already taken by another user' }, { status: 409 });
      }

      await db.execute({
        sql: 'UPDATE users SET color = ? WHERE id = ?',
        args: [color, user.userId],
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
