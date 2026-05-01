'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) router.replace('/dashboard');
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0ms' }}>
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase bg-lime-400/10 text-lime-400 border border-lime-400/20">
            Summer 2025
          </span>
        </div>

        <h1
          className="font-display text-6xl md:text-8xl tracking-tight mb-4 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          <span className="text-lime-400">SQUAD LT</span>
        </h1>

        <p
          className="text-lg md:text-xl text-zinc-400 mb-12 leading-relaxed animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Track habits. Build discipline.<br />
          Compete with your crew.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
          style={{ animationDelay: '300ms' }}
        >
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3.5 bg-lime-400 text-dark-900 font-bold rounded-xl
                       hover:bg-lime-300 transition-all duration-200
                       hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]
                       active:scale-95"
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-8 py-3.5 border border-zinc-700 text-zinc-300 font-medium rounded-xl
                       hover:border-lime-400/50 hover:text-lime-400 transition-all duration-200
                       active:scale-95"
          >
            Join the Crew
          </button>
        </div>

        {/* Feature pills */}
        <div
          className="mt-16 flex flex-wrap justify-center gap-3 animate-slide-up"
          style={{ animationDelay: '400ms' }}
        >
          {['💧 Water', '🥩 Protein', '🥗 Eating', '🏋️ Workout', '🏃 Cardio', '😴 Sleep'].map((item) => (
            <span
              key={item}
              className="px-3 py-1.5 rounded-lg text-sm text-zinc-500 bg-dark-700/50 border border-zinc-800"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
