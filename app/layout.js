import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata = {
  title: 'SQUAD LT — Habit Tracker',
  description: 'Track healthy habits with your crew before the big trip',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise min-h-screen">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
