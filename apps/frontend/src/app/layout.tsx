import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { AuthProvider } from '@/components/auth/AuthProvider';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

export const metadata: Metadata = {
  title: 'Daily English Lab',
  description: 'AI-powered English practice — built for real improvement.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sora.variable}>
      <body className="bg-[#F8F5F0] dark:bg-[#0C1520] text-gray-900 dark:text-gray-100 font-sora min-h-screen">
        <AuthProvider>
          <TopBar />
          <main className="pb-20 md:pb-0 min-h-screen">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
