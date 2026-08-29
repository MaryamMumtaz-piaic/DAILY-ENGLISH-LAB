import type { UserMistake } from '@/types';
import { cn } from '@/lib/utils';

interface MistakeListProps {
  mistakes: UserMistake[];
}

function severityColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
  }
}

export function MistakeList({ mistakes }: MistakeListProps) {
  if (mistakes.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">No mistakes recorded yet. Keep practicing!</p>
    );
  }

  return (
    <div className="space-y-3">
      {mistakes.map((mistake) => (
        <div
          key={mistake.id}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full',
                    severityColor(mistake.severity)
                  )}
                >
                  {mistake.severity}
                </span>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {mistake.category.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Frequency bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (mistake.frequency / 10) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {mistake.frequency}x
                </span>
              </div>
            </div>

            {/* Improvement */}
            {mistake.improvement !== 0 && (
              <div
                className={cn(
                  'text-xs font-semibold flex-shrink-0',
                  mistake.improvement > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                )}
              >
                {mistake.improvement > 0 ? '↓' : '↑'} {Math.abs(mistake.improvement)}%
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Last seen: {new Date(mistake.lastSeen).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
