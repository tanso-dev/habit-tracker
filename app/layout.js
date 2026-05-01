import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: 'SQUAD LT — Habit Tracker',
  description: 'Track healthy habits with your crew before the big trip',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="noise min-h-screen">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
