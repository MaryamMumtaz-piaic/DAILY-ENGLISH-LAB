import { Button } from '@/components/ui/Button';

interface SummaryData {
  durationSec?: number;
  sentencesPracticed?: number;
  areasPracticed?: string[];
  recurringMistakes?: string[];
  improvementSignals?: string[];
  recommendedFocus?: string;
}

interface SessionSummaryProps {
  summary: unknown;
  onNewSession: () => void;
}

function parseSummary(raw: unknown): SummaryData {
  if (raw && typeof raw === 'object') {
    return raw as SummaryData;
  }
  return {};
}

export function SessionSummary({ summary, onNewSession }: SessionSummaryProps) {
  const data = parseSummary(summary);
  const durationMin = data.durationSec ? Math.round(data.durationSec / 60) : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center">
        <span className="text-5xl">🎉</span>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-3">
          Session Complete!
        </h2>
        <p className="text-gray-500 text-sm mt-1">Here&apos;s how you did</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-primary">{durationMin}</p>
          <p className="text-xs text-gray-500 mt-1">Minutes practiced</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-3xl font-bold text-primary">
            {data.sentencesPracticed ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Sentences practiced</p>
        </div>
      </div>

      {/* Areas practiced */}
      {data.areasPracticed && data.areasPracticed.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Areas practiced
          </p>
          <div className="flex flex-wrap gap-2">
            {data.areasPracticed.map((area, i) => (
              <span
                key={i}
                className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recurring mistakes */}
      {data.recurringMistakes && data.recurringMistakes.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-2">
            Keep working on
          </p>
          <ul className="space-y-1">
            {data.recurringMistakes.map((m, i) => (
              <li key={i} className="text-sm text-amber-800 dark:text-amber-200">
                • {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement signals */}
      {data.improvementSignals && data.improvementSignals.length > 0 && (
        <div className="bg-green-50 dark:bg-green-950 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">
            Great progress
          </p>
          <ul className="space-y-1">
            {data.improvementSignals.map((s, i) => (
              <li key={i} className="text-sm text-green-800 dark:text-green-200">
                ✓ {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended focus */}
      {data.recommendedFocus && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-1">
            Tomorrow&apos;s focus
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200">{data.recommendedFocus}</p>
        </div>
      )}

      <Button size="lg" className="w-full" onClick={onNewSession}>
        Start New Session
      </Button>
    </div>
  );
}
