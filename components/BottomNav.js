'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Log',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <rect x="4" y="4" width="16" height="16" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    label: 'Board',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.27 6.82 21 8 14.14l-5-4.87 6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Profile',
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on auth pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Spacer to push page content above the nav */}
      <div className="h-20" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/60">
        {/* Solid background extending well past the bottom for Safari's URL bar */}
        <div className="absolute left-0 right-0 bg-dark-900" style={{ top: 0, bottom: '-100px' }} />
        <div className="relative max-w-lg mx-auto flex items-center justify-around py-3 px-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-5 py-1.5 rounded-xl transition-all duration-200
                           ${isActive
                             ? 'text-lime-400'
                             : 'text-zinc-600 hover:text-zinc-400'
                           }`}
              >
                {item.icon(isActive)}
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
        {/* Extra space for Safari safe area */}
        <div className="relative" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </nav>
    </>
  );
}
