'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RANK_STYLES = [
  { bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', medal: '🥇' },
  { bg: 'bg-zinc-300/10', border: 'border-zinc-400/30', medal: '🥈' },
  { bg: 'bg-orange-400/10', border: 'border-orange-400/30', medal: '🥉' },
];

const FILTERS = [
  { key: 'total_points', label: 'Overall', emoji: '🏆' },
  { key: 'total_water', label: 'Water', emoji: '💧' },
  { key: 'total_protein', label: 'Protein', emoji: '🥩' },
  { key: 'total_eating', label: 'Eating', emoji: '🥗' },
  { key: 'total_workout', label: 'Workout', emoji: '🏋️' },
  { key: 'total_cardio', label: 'Cardio', emoji: '🏃' },
  { key: 'total_sleep', label: 'Sleep', emoji: '😴' },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState('total_points');

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.user) router.replace('/login');
        else setCurrentUser(data.user);
      });

    fetch('/api/leaderboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setLeaderboard(data.leaderboard || []);
        setLoading(false);
      });
  }, [router]);

  // Sort by selected filter (descending)
  const sorted = [...leaderboard].sort((a, b) => {
    return (b[filter] || 0) - (a[filter] || 0);
  });

  const activeFilter = FILTERS.find(f => f.key === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-40">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="font-display text-xl text-lime-400">SQUAD LT</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-8">
        <h2 className="text-2xl font-bold text-white mb-2">🏆 Leaderboard</h2>
        <p className="text-zinc-500 mb-6">Who's racked up the most points?</p>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-4">🦗</div>
            <p>No one has checked in yet. Be first!</p>
          </div>
        ) : (
          <>
            {/* Filter dropdown */}
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-zinc-500">Showing</span>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-9 bg-dark-700 border border-zinc-800 rounded-xl
                             text-sm text-white font-medium outline-none cursor-pointer
                             focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20
                             transition-all"
                >
                  {FILTERS.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.emoji} {f.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-xs">
                  ▾
                </div>
              </div>
            </div>

            {/* Ranked list */}
            <div className="space-y-3">
              {sorted.map((user, index) => {
                const rankStyle = RANK_STYLES[index] || null;
                const isMe = currentUser && currentUser.username === user.username;
                const points = user[filter] || 0;
                const pointLabel = filter === 'total_points' ? 'pts' : 'days';

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                               animate-slide-up
                               ${rankStyle
                                 ? `${rankStyle.bg} ${rankStyle.border}`
                                 : 'bg-dark-700/50 border-zinc-800'
                               }
                               ${isMe ? 'ring-1 ring-lime-400/30' : ''}`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    {/* Rank */}
                    <div className="w-10 text-center flex-shrink-0">
                      {rankStyle ? (
                        <span className="text-2xl">{rankStyle.medal}</span>
                      ) : (
                        <span className="text-zinc-600 font-bold text-lg">#{index + 1}</span>
                      )}
                    </div>

                    {/* Color dot + user info */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: user.color || '#a3e635' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white truncate">
                          {user.display_name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-lime-400/20 text-lime-400">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-600">
                        <span>{user.days_checked_in} day{user.days_checked_in !== 1 ? 's' : ''}</span>
                        {user.streak > 0 && (
                          <span className="text-orange-400">🔥 {user.streak} streak</span>
                        )}
                      </div>
                    </div>

                    {/* Points for this filter */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xl font-display ${rankStyle ? 'text-lime-400' : 'text-white'}`}>
                        {points}
                      </div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wider">{pointLabel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
