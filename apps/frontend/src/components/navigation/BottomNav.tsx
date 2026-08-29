'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/practice', label: 'Practice', icon: '🎙️' },
  { href: '/progress', label: 'Progress', icon: '📈' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors',
            pathname.startsWith(item.href)
              ? 'text-primary'
              : 'text-gray-400 hover:text-gray-600'
          )}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
