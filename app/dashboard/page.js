'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const HABITS = [
  { id: 'water', label: 'Water Intake', emoji: '💧', description: 'Hit your daily water goal' },
  { id: 'protein', label: 'Protein Intake', emoji: '🥩', description: 'Hit your daily protein goal' },
  { id: 'eating', label: 'Healthy Eating', emoji: '🥗', description: 'Ate clean and healthy today' },
  { id: 'workout', label: 'Daily Workout', emoji: '🏋️', description: 'Complete a workout session' },
  { id: 'cardio', label: 'Daily Cardio', emoji: '🏃', description: 'Complete a cardio session' },
  { id: 'sleep', label: '7+ Hrs Sleep', emoji: '😴', description: 'Got at least 7 hours of sleep' },
];

function getLocalDateStr(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayDate() {
  return getLocalDateStr(new Date());
}

function getDaysUntilTrip() {
  const trip = new Date('2026-07-15T00:00:00');
  const now = new Date();
  const diff = Math.ceil((trip - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getDateOptions() {
  const options = [];
  const today = new Date();
  for (let i = 0; i < 10; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const value = getLocalDateStr(d);
    let label;
    if (i === 0) {
      label = 'Today';
    } else if (i === 1) {
      label = 'Yesterday';
    } else {
      label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
    options.push({ value, label });
  }
  return options;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const dateOptions = getDateOptions();

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.user) router.replace('/login');
        else setUser(data.user);
      });
  }, [router]);

  const loadCheckIn = useCallback((date) => {
    setLoading(true);
    fetch(`/api/check-in?date=${date}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.checkin) {
          setHabits({
            water: !!data.checkin.water,
            protein: !!data.checkin.protein,
            eating: !!data.checkin.eating,
            workout: !!data.checkin.workout,
            cardio: !!data.checkin.cardio,
            sleep: !!data.checkin.sleep,
          });
          setSubmitted(true);
        } else {
          setHabits({});
          setSubmitted(false);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCheckIn(selectedDate);
  }, [selectedDate, loadCheckIn]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const toggleHabit = (id) => {
    setHabits(prev => ({ ...prev, [id]: !prev[id] }));
    setSubmitted(false);
  };

  const totalPoints = Object.values(habits).filter(Boolean).length;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...habits, date: selectedDate }),
      });
      if (res.ok) {
        setSubmitted(true);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch {
      // handle error
    }
    setSaving(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isToday = selectedDate === getTodayDate();
  const greeting = user.display_name || user.username;

  return (
    <main className="min-h-screen pb-28">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="font-display text-xl text-lime-400">SQUAD LT</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-8">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            Hey {greeting},
          </h2>
          <p className="text-zinc-400">
            {getDaysUntilTrip() > 0
              ? <>Only <span className="font-bold text-white">{getDaysUntilTrip()} days</span> before the trip. What do you want to log?</>
              : getDaysUntilTrip() === 0
                ? `The trip is TODAY! 🎉`
                : `Hope the trip was amazing! Keep logging.`
            }
          </p>
        </div>

        {/* Date picker */}
        <div className="mb-8">
          <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
            Logging for
          </label>
          <div className="relative">
            <select
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full appearance-none px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                         text-white outline-none cursor-pointer
                         focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20
                         transition-all pr-10"
            >
              {dateOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
              ▾
            </div>
          </div>
          {!isToday && (
            <p className="text-xs text-yellow-400/80 mt-2">
              📅 Logging for a past date — {formatDateFull(selectedDate)}
            </p>
          )}
        </div>

        {/* Points display */}
        <div className="bg-dark-700 border border-zinc-800 rounded-2xl p-6 mb-8 text-center">
          <div className="text-5xl font-display text-lime-400 mb-1">{totalPoints}/6</div>
          <div className="text-zinc-500 text-sm">
            points {isToday ? 'today' : formatDateFull(selectedDate)}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className={`w-10 h-1.5 rounded-full transition-all duration-300 ${
                  i <= totalPoints ? 'bg-lime-400' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Habit checklist */}
            <div className="space-y-3 mb-8">
              {HABITS.map((habit, index) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                             animate-slide-up
                             ${habits[habit.id]
                               ? 'bg-lime-400/10 border-lime-400/30'
                               : 'bg-dark-700/50 border-zinc-800 hover:border-zinc-700'
                             }`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0
                               transition-all duration-200
                               ${habits[habit.id]
                                 ? 'bg-lime-400 border-lime-400'
                                 : 'border-zinc-600'
                               }`}
                  >
                    {habits[habit.id] && (
                      <svg className="w-3.5 h-3.5 text-dark-900 animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <div className={`font-medium transition-colors ${habits[habit.id] ? 'text-lime-400' : 'text-white'}`}>
                      {habit.emoji} {habit.label}
                    </div>
                    <div className="text-xs text-zinc-600 mt-0.5">{habit.description}</div>
                  </div>

                  <div className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    habits[habit.id] ? 'bg-lime-400/20 text-lime-400' : 'bg-zinc-800 text-zinc-600'
                  }`}>
                    +1
                  </div>
                </button>
              ))}
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={saving || totalPoints === 0}
              className={`w-full py-4 font-bold rounded-xl transition-all duration-200
                         active:scale-[0.98] disabled:opacity-50
                         ${submitted
                           ? 'bg-dark-700 border border-lime-400/30 text-lime-400'
                           : 'bg-lime-400 text-dark-900 hover:bg-lime-300 hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]'
                         }`}
            >
              {saving
                ? 'Saving...'
                : submitted
                  ? '✓ Saved — Tap to Update'
                  : isToday ? 'Submit Today' : `Submit for ${formatDateFull(selectedDate)}`
              }
            </button>
          </>
        )}

        {/* Success toast */}
        {showSuccess && (
          <div className="fixed bottom-20 left-4 right-4 flex justify-center z-50">
            <div className="bg-lime-400 text-dark-900 font-bold px-6 py-3 rounded-xl shadow-lg animate-pop">
              🔥 {totalPoints} point{totalPoints !== 1 ? 's' : ''} logged!
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
