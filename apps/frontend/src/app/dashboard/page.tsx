'use client';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {getGreeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-gray-500 mt-1">Ready for today&apos;s English practice?</p>
      </div>

      {/* Daily goal card */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Daily Goal</p>
            <p className="text-xs text-gray-400">0 / {user?.dailyGoalMin ?? 15} min today</p>
          </div>
          <span className="text-2xl">🎯</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: '0%' }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Start a session to begin tracking</p>
      </Card>

      {/* CTA */}
      <Link href="/practice">
        <Button size="lg" className="w-full mb-6">
          🎙️ Start Practice
        </Button>
      </Link>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">🔥</span>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <p className="text-xs text-gray-500">Day streak</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-xl">📚</span>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
          <p className="text-xs text-gray-500">Total sessions</p>
        </Card>
      </div>

      {/* Level badge */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
            {user?.level === 'ADVANCED' ? '🏆' : user?.level === 'INTERMEDIATE' ? '⭐' : '🌱'}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {user?.level ?? 'BEGINNER'}
            </p>
            <p className="text-xs text-gray-400">Current level</p>
          </div>
          <div className="ml-auto">
            <Link href="/progress" className="text-xs text-primary font-medium hover:underline">
              View progress →
            </Link>
          </div>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Quick start
        </h2>
        <div className="space-y-2">
          {[
            { href: '/practice/conversation', icon: '💬', title: 'AI Conversation', desc: 'Talk with your AI English coach' },
            { href: '/practice/read-speak', icon: '📖', title: 'Read & Speak', desc: 'Practice reading sentences aloud' },
            { href: '/practice/fix-english', icon: '✏️', title: 'Fix My English', desc: 'Paste text, get it improved' },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 hover:border-primary/50 transition-colors">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <span className="text-gray-300">›</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
