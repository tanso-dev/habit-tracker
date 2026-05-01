'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-lime-400 transition-colors mb-8 text-sm"
        >
          ← Back
        </Link>

        <h1 className="font-display text-3xl text-lime-400 mb-2">LOG IN</h1>
        <p className="text-zinc-500 mb-8">Welcome back.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                         text-white placeholder-zinc-600 outline-none
                         focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20
                         transition-all"
              placeholder="Your username"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-zinc-800 rounded-xl
                         text-white placeholder-zinc-600 outline-none
                         focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20
                         transition-all"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-lime-400 text-dark-900 font-bold rounded-xl
                       hover:bg-lime-300 transition-all duration-200 disabled:opacity-50
                       hover:shadow-[0_0_30px_rgba(163,230,53,0.3)]
                       active:scale-[0.98]"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-zinc-600 mt-6 text-sm">
          New here?{' '}
          <Link href="/register" className="text-lime-400 hover:underline">
            Join the crew
          </Link>
        </p>
      </div>
    </main>
  );
}
