'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi } from '@/lib/api';
import type { Correction } from '@/types';
import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { Button } from '@/components/ui/Button';

export default function FixEnglishPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (!text.trim() || isAnalyzing) return;
    setError('');
    setCorrection(null);
    setIsAnalyzing(true);

    try {
      const res = await practiceApi.analyzeText(text.trim());
      setCorrection(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { message?: string } } } };
      setError(
        axiosErr?.response?.data?.error?.message || 'Analysis failed. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleReset() {
    setText('');
    setCorrection(null);
    setError('');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/practice')}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          ‹
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Fix My English</h1>
          <p className="text-gray-400 text-xs">Paste any English text and get it corrected</p>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 mb-4 shadow-sm">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
          Your text
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your English text here..."
          rows={5}
          className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none resize-none leading-relaxed"
          disabled={isAnalyzing}
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-400">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
          <div className="flex gap-2">
            {(correction || text) && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleAnalyze}
              loading={isAnalyzing}
              disabled={!text.trim()}
            >
              Analyze
            </Button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {correction && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Analysis result
          </h2>
          <CorrectionCard
            correction={correction}
            onRetry={() => {
              setCorrection(null);
            }}
          />

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
              Overall score
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${correction.overallScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-primary">{correction.overallScore}/100</span>
            </div>
          </div>

          <Button variant="outline" size="md" className="w-full" onClick={handleReset}>
            Analyze another text
          </Button>
        </div>
      )}

      {/* Placeholder */}
      {!correction && !isAnalyzing && !text && (
        <div className="text-center py-12">
          <span className="text-5xl mb-4 block">✏️</span>
          <p className="text-gray-400 text-sm">
            Enter any English sentence, paragraph, or email draft above and we&apos;ll correct it for you.
          </p>
          <div className="mt-6 space-y-2">
            {[
              'I am very exciting about this opportunity.',
              'She go to school everyday.',
              'He have been working here since 5 years.',
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setText(example)}
                className="block w-full text-left text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl px-4 py-2.5 transition-colors"
              >
                Try: &ldquo;{example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
