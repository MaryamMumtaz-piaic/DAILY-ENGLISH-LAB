'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Home' },
  { href: '/practice', label: 'Practice' },
  { href: '/progress', label: 'Progress' },
];

export function TopBar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="hidden md:flex sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700 h-14 items-center px-6 gap-8">
      <Link
        href="/dashboard"
        className="font-bold text-primary text-lg flex items-center gap-2"
      >
        <span>🧪</span> Daily English Lab
      </Link>
      <nav className="flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'text-primary'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-3">
        {user && <span className="text-sm text-gray-500">{user.name}</span>}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
