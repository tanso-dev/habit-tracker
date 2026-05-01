'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Calculate age from DOB
function getAge(dobStr) {
  if (!dobStr) return null;
  const dob = new Date(dobStr + 'T12:00:00');
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// Protein: 1g per cm of height (Jeff Nippard / Eric Helms method)
function getProteinGoal(heightCm) {
  if (!heightCm) return null;
  return Math.round(heightCm);
}

// Water: Based on National Academy of Medicine guidelines
// Men: ~125 oz (3.7L), Women: ~91 oz (2.7L)
// Adjusted slightly for active individuals (assumed since they're in this competition)
function getWaterGoal(gender, age) {
  if (!gender) return null;
  let baseOz = gender === 'male' ? 125 : 91;
  // Slight reduction for older adults (60+)
  if (age && age >= 60) baseOz = Math.round(baseOz * 0.9);
  return baseOz;
}

function cmToFeetInches(cm) {
  if (!cm) return '';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#a3e635');
  const [colorOptions, setColorOptions] = useState([]);
  const [takenColors, setTakenColors] = useState([]);
  const [dob, setDob] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [gender, setGender] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (!data.user) router.replace('/login');
        else setUser(data.user);
      });

    fetch('/api/profile', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setDisplayName(data.profile.display_name || data.profile.username);
          setSelectedColor(data.profile.color || '#a3e635');
          setDob(data.profile.dob || '');
          setGender(data.profile.gender || '');
          if (data.profile.height_cm) {
            const totalInches = data.profile.height_cm / 2.54;
            setHeightFeet(String(Math.floor(totalInches / 12)));
            setHeightInches(String(Math.round(totalInches % 12)));
          }
        }
        if (data.allowed_colors) setColorOptions(data.allowed_colors);
        if (data.taken_colors) setTakenColors(data.taken_colors);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Calculate height in cm from feet/inches
  const heightCm = (heightFeet && heightInches !== '')
    ? (parseInt(heightFeet) * 12 + parseInt(heightInches)) * 2.54
    : null;

  const age = getAge(dob);
  const proteinGoal = getProteinGoal(heightCm);
  const waterGoal = getWaterGoal(gender, age);

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      const body = {
        display_name: displayName,
        color: selectedColor,
      };

      if (dob) body.dob = dob;
      if (heightCm) body.height_cm = Math.round(heightCm);
      if (gender) body.gender = gender;

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save');
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        const profileRes = await fetch('/api/profile', { cache: 'no-store' });
        const profileData = await profileRes.json();
        if (profileData.taken_colors) setTakenColors(profileData.taken_colors);
      }
    } catch {
      setError('Something went wrong');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const colorPairs = [];
  for (let i = 0; i < colorOptions.length; i += 2) {
    colorPairs.push({ light: colorOptions[i], dark: colorOptions[i + 1] });
  }

  const isColorTaken = (colorValue) => {
    return takenColors.includes(colorValue) && colorValue !== selectedColor;
  };

  return (
    <main className="min-h-screen pb-28">
      <header className="border-b border-zinc-800/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="font-display text-xl text-lime-400">SQUAD LT</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-8">
        <h2 className="text-2xl font-bold text-white mb-2">⚙️ Settings</h2>
        <p className="text-zinc-500 mb-8">Customize your profile</p>

        {/* Display Name */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <label className="block text-sm text-zinc-400 mb-2">Display Name</label>
          <p className="text-xs text-zinc-600 mb-3">
            This is how your name appears on the leaderboard.
          </p>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                       text-white placeholder-zinc-600 outline-none
                       focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
            placeholder="Your display name"
            maxLength={20}
          />
          <p className="text-xs text-zinc-700 mt-1.5 text-right">{displayName.length}/20</p>
        </div>

        {/* Body Stats Section */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '50ms' }}>
          <label className="block text-sm text-zinc-400 mb-2">Your Stats</label>
          <p className="text-xs text-zinc-600 mb-4">
            Used to calculate your daily water and protein goals. No weight needed.
          </p>

          {/* Gender */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-500 mb-2">Gender</label>
            <div className="flex gap-3">
              {[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(g.value)}
                  className={`flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200
                             ${gender === g.value
                               ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                               : 'bg-dark-700 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                             }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* DOB */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-500 mb-2">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                         text-white outline-none
                         focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all
                         [color-scheme:dark]"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Height in feet/inches */}
          <div className="mb-4">
            <label className="block text-xs text-zinc-500 mb-2">Height</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                               text-white placeholder-zinc-600 outline-none
                               focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all pr-10"
                    placeholder="5"
                    min="3"
                    max="8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">ft</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                               text-white placeholder-zinc-600 outline-none
                               focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all pr-10"
                    placeholder="10"
                    min="0"
                    max="11"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Card */}
        {(proteinGoal || waterGoal) && (
          <div className="mb-8 bg-dark-700/50 border border-zinc-800 rounded-xl p-5 animate-slide-up" style={{ animationDelay: '75ms' }}>
            <h3 className="text-sm font-bold text-white mb-4">Your Daily Targets</h3>
            <div className="grid grid-cols-2 gap-4">
              {waterGoal && (
                <div className="bg-dark-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-2xl font-display text-lime-400">{waterGoal}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">oz / day</div>
                  <div className="text-xs text-zinc-600 mt-1">{(waterGoal * 0.0296).toFixed(1)}L</div>
                </div>
              )}
              {proteinGoal && (
                <div className="bg-dark-900/50 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">🥩</div>
                  <div className="text-2xl font-display text-lime-400">{proteinGoal}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">grams / day</div>
                  <div className="text-xs text-zinc-600 mt-1">1g per cm height</div>
                </div>
              )}
            </div>
            <p className="text-[10px] text-zinc-700 mt-3 text-center">
              Water based on NAM guidelines · Protein via Jeff Nippard / Eric Helms method
            </p>
          </div>
        )}

        {/* Color Picker */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <label className="block text-sm text-zinc-400 mb-2">Your Color</label>
          <p className="text-xs text-zinc-600 mb-4">
            Each color can only be used by one person.
          </p>
          <div className="space-y-3">
            {colorPairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="flex gap-3">
                {[pair.light, pair.dark].filter(Boolean).map((color) => {
                  const taken = isColorTaken(color.value);
                  const isSelected = selectedColor === color.value;
                  return (
                    <button
                      key={color.value}
                      onClick={() => !taken && setSelectedColor(color.value)}
                      disabled={taken}
                      className={`relative flex-1 h-12 rounded-xl transition-all duration-200
                                 ${taken ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                                 ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-dark-900 scale-105' : ''}`}
                      style={{ backgroundColor: color.value }}
                      title={taken ? `${color.label} — taken` : color.label}
                    >
                      {isSelected && (
                        <svg className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-md animate-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {taken && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-bold drop-shadow-md">TAKEN</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg mb-4">{error}</p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !displayName.trim()}
          className="w-full py-4 bg-lime-400 text-dark-900 font-bold rounded-xl
                     hover:bg-lime-300 transition-all duration-200 disabled:opacity-50
                     hover:shadow-[0_0_30px_rgba(251,146,60,0.3)]
                     active:scale-[0.98] animate-slide-up mb-6"
          style={{ animationDelay: '200ms' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>

        <div className="border-t border-zinc-800 my-6" />

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 border border-zinc-800 text-zinc-500 font-medium rounded-xl
                     hover:border-red-400/30 hover:text-red-400 transition-all duration-200
                     active:scale-[0.98] animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          Log Out
        </button>

        {/* Success toast */}
        {showSuccess && (
          <div className="fixed bottom-20 left-4 right-4 flex justify-center z-50">
            <div className="bg-lime-400 text-dark-900 font-bold px-6 py-3 rounded-xl shadow-lg animate-pop">
              ✅ Settings saved!
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
