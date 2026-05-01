export const HABITS = [
  { id: 'water', label: 'Water Intake', emoji: '💧', description: 'Hit your daily water goal' },
  { id: 'protein', label: 'Protein Intake', emoji: '🥩', description: 'Hit your daily protein goal' },
  { id: 'eating', label: 'Healthy Eating', emoji: '🥗', description: 'Ate clean and healthy today' },
  { id: 'workout', label: 'Daily Workout', emoji: '🏋️', description: 'Complete a workout session' },
  { id: 'cardio', label: 'Daily Cardio', emoji: '🏃', description: 'Complete a cardio session' },
  { id: 'sleep', label: '7+ Hrs Sleep', emoji: '😴', description: 'Get at least 7 hours of sleep' },
];

export const POINTS_PER_HABIT = 1;
export const MAX_DAILY_POINTS = HABITS.length * POINTS_PER_HABIT;

export const COMPETITION_END = '2026-07-15';
