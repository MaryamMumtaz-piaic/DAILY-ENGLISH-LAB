'use client';
import { useState, useEffect } from 'react';
import { progressApi } from '@/lib/api';
import type { ProgressSnapshot, UserMistake } from '@/types';
import { MistakeList } from '@/components/progress/MistakeList';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';

interface ProgressData {
  snapshots: ProgressSnapshot[];
  streak: number;
  totalMinutes: number;
  totalSessions: number;
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [mistakes, setMistakes] = useState<UserMistake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([progressApi.getProgress(), progressApi.getMistakes()])
      .then(([progRes, mistakesRes]) => {
        setData(progRes.data.data);
        setMistakes(mistakesRes.data.data);
      })
      .catch(() => setError('Failed to load progress data.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Progress</h1>
        <p className="text-gray-500 mt-1">Track your English improvement over time</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-primary">{data?.streak ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">🔥 Streak</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-primary">{data?.totalMinutes ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">⏱️ Minutes</div>
        </Card>
        <Card className="text-center py-4">
          <div className="text-3xl font-bold text-primary">{data?.totalSessions ?? 0}</div>
          <div className="text-xs text-gray-400 mt-1">📚 Sessions</div>
        </Card>
      </div>

      {/* Mistakes */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
          Common mistakes
        </h2>
        <MistakeList mistakes={mistakes} />
      </div>

      {/* Recent sessions */}
      {data?.snapshots && data.snapshots.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
            Recent sessions
          </h2>
          <div className="space-y-3">
            {data.snapshots.slice(0, 5).map((snap) => (
              <Card key={snap.id}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-primary font-semibold text-sm">
                        {snap.durationMin} min
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-400">
                        {snap.sentencesPracticed} sentences
                      </span>
                    </div>
                    {snap.areasPracticed.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snap.areasPracticed.map((area, i) => (
                          <span
                            key={i}
                            className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(snap.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {snap.recommendedFocus && (
                  <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    Focus next: {snap.recommendedFocus}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {data?.snapshots?.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl block mb-4">📊</span>
          <p className="text-gray-400 text-sm">
            No sessions yet. Complete a practice session to see your progress here.
          </p>
        </div>
      )}
    </div>
  );
}
