import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = getDb();

    // Get all users with their total points and streak info
    const leaderboard = await db.execute(`
      SELECT
        u.id,
        u.username,
        COALESCE(u.display_name, u.username) as display_name,
        COALESCE(u.color, '#a3e635') as color,
        COALESCE(SUM(c.total_points), 0) as total_points,
        COUNT(c.id) as days_checked_in,
        COALESCE(SUM(c.water), 0) as total_water,
        COALESCE(SUM(c.protein), 0) as total_protein,
        COALESCE(SUM(c.eating), 0) as total_eating,
        COALESCE(SUM(c.workout), 0) as total_workout,
        COALESCE(SUM(c.cardio), 0) as total_cardio,
        COALESCE(SUM(c.sleep), 0) as total_sleep
      FROM users u
      LEFT JOIN check_ins c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY total_points DESC, days_checked_in DESC
    `);

    // Calculate streaks for each user
    const usersWithStreaks = [];
    for (const user of leaderboard.rows) {
      const streakResult = await db.execute({
        sql: `SELECT date FROM check_ins
              WHERE user_id = ? AND total_points > 0
              ORDER BY date DESC`,
        args: [user.id],
      });

      let streak = 0;
      const today = new Date();
      let checkDate = new Date(today);

      for (const row of streakResult.rows) {
        const rowDate = row.date;
        const expected = checkDate.toISOString().split('T')[0];
        if (rowDate === expected) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Also check if the first miss is today (haven't checked in yet today)
          if (streak === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yesterdayExpected = checkDate.toISOString().split('T')[0];
            if (rowDate === yesterdayExpected) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
              continue;
            }
          }
          break;
        }
      }

      usersWithStreaks.push({
        ...user,
        streak,
      });
    }

    return NextResponse.json({ leaderboard: usersWithStreaks });
  } catch (err) {
    console.error('Leaderboard error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
