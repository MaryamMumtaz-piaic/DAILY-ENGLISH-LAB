import Link from 'next/link';

const modes = [
  {
    href: '/practice/conversation',
    icon: '💬',
    title: 'AI Conversation',
    description: 'Talk with your AI English coach. Get real-time corrections and natural feedback.',
    color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    href: '/practice/read-speak',
    icon: '📖',
    title: 'Read & Speak',
    description: 'Practice reading English sentences aloud and get pronunciation feedback.',
    color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
  },
  {
    href: '/practice/fix-english',
    icon: '✏️',
    title: 'Fix My English',
    description: 'Paste any English text and get it corrected with detailed explanations.',
    color: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
  },
];

export default function PracticePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Practice</h1>
        <p className="text-gray-500 mt-1">Choose how you want to practice today</p>
      </div>

      <div className="space-y-4">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href}>
            <div
              className={`flex items-start gap-4 rounded-2xl border p-5 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${mode.color}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${mode.iconBg}`}>
                {mode.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{mode.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {mode.description}
                </p>
              </div>
              <span className="text-gray-400 dark:text-gray-600 mt-1 flex-shrink-0">›</span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg">💡</span>
          <p className="font-semibold text-primary text-sm">Pro tip</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Daily practice, even just 10 minutes, is more effective than one long session per week.
          Try to practice at the same time each day to build the habit.
        </p>
      </div>
    </div>
  );
}
