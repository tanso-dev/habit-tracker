import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { HABITS } from '@/lib/habits';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function isValidDate(dateStr) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  const d = new Date(dateStr + 'T12:00:00');
  return !isNaN(d.getTime());
}

function isNotFuture(dateStr) {
  const today = getTodayDate();
  return dateStr <= today;
}

export async function GET(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || getTodayDate();

  if (!isValidDate(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM check_ins WHERE user_id = ? AND date = ?',
    args: [user.userId, date],
  });

  if (result.rows.length === 0) {
    return NextResponse.json({ checkin: null, date });
  }

  return NextResponse.json({ checkin: result.rows[0], date });
}

export async function POST(request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const db = getDb();
    const date = body.date || getTodayDate();

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (!isNotFuture(date)) {
      return NextResponse.json({ error: 'Cannot log future dates' }, { status: 400 });
    }

    // Build values from habits config
    const values = {};
    let total = 0;
    for (const habit of HABITS) {
      values[habit.id] = body[habit.id] ? 1 : 0;
      total += values[habit.id];
    }

    // Upsert
    await db.execute({
      sql: `INSERT INTO check_ins (user_id, date, water, protein, eating, workout, cardio, sleep, total_points)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, date)
            DO UPDATE SET water=?, protein=?, eating=?, workout=?, cardio=?, sleep=?, total_points=?`,
      args: [
        user.userId, date,
        values.water, values.protein, values.eating, values.workout, values.cardio, values.sleep, total,
        values.water, values.protein, values.eating, values.workout, values.cardio, values.sleep, total,
      ],
    });

    return NextResponse.json({ success: true, total_points: total });
  } catch (err) {
    console.error('Check-in error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
