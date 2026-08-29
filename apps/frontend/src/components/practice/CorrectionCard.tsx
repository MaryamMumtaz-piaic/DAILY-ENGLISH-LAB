import type { Correction } from '@/types';
import { cn } from '@/lib/utils';

export function CorrectionCard({
  correction,
  onRetry,
}: {
  correction: Correction;
  onRetry?: () => void;
}) {
  if (correction.isCorrect) {
    return (
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-4">
        <p className="text-green-700 dark:text-green-300 font-medium text-sm">
          ✓ {correction.encouragement}
        </p>
        {correction.naturalAlternative && (
          <p className="text-green-600 dark:text-green-400 text-xs mt-1">
            Natural alternative: <span className="italic">{correction.naturalAlternative}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Your sentence
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm line-through">
          {correction.originalText}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
          Correction
        </p>
        <p className="text-gray-800 dark:text-gray-100 text-sm font-medium">
          {correction.correctedText}
        </p>
      </div>

      {correction.naturalAlternative && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
            Natural alternative
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm italic">
            {correction.naturalAlternative}
          </p>
        </div>
      )}

      {correction.mistakes.map((m, i) => (
        <div key={i} className="bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2">
          <span
            className={cn(
              'inline-block text-xs font-semibold px-2 py-0.5 rounded-full mr-2 mb-1',
              m.severity === 'high'
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
            )}
          >
            {m.category.replace(/_/g, ' ')}
          </span>
          <p className="text-sm text-gray-700 dark:text-gray-300">{m.explanation}</p>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <p className="text-sm text-primary font-medium">{correction.encouragement}</p>
        <span className="text-xs text-gray-400">Score: {correction.overallScore}/100</span>
      </div>

      {correction.shouldRetry && onRetry && (
        <button
          onClick={onRetry}
          className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
