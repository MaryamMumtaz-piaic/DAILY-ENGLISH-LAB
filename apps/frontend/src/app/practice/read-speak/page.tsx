'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { practiceApi, speechApi } from '@/lib/api';
import type { PracticeSession, Correction } from '@/types';
import { MicButton } from '@/components/speech/MicButton';
import { useAudioRecorder } from '@/components/speech/useAudioRecorder';
import { CorrectionCard } from '@/components/practice/CorrectionCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const SENTENCES = [
  'I have been working on this project since Monday.',
  'She didn\'t go to school yesterday because she was sick.',
  'They will have finished the report by tomorrow morning.',
  'He has been learning English for three years.',
  'We were watching a movie when the power went out.',
  'If I had known earlier, I would have called you.',
  'The book that she recommended was absolutely fascinating.',
  'By the time you arrive, I will have already eaten dinner.',
  'She asked me whether I wanted to join them for lunch.',
  'Despite the rain, we decided to go for a walk in the park.',
];

type Phase = 'reading' | 'recording' | 'result';

export default function ReadSpeakPage() {
  const router = useRouter();

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('reading');
  const [correction, setCorrection] = useState<Correction | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { state: micState, audioBlob, startRecording, stopRecording, reset: resetMic } = useAudioRecorder();

  // Create read-speak session
  useEffect(() => {
    practiceApi
      .createSession('READ_SPEAK')
      .then((res) => setSession(res.data.data.session))
      .catch(() => {}) // best-effort session creation
      .finally(() => setIsInitializing(false));
  }, []);

  // Handle audio ready
  useEffect(() => {
    if (audioBlob) {
      (async () => {
        setIsProcessing(true);
        try {
          const res = await speechApi.transcribe(audioBlob, session?.id ?? 'read-speak');
          setTranscript(res.data.data.transcript);

          // Analyze transcribed text against the current sentence
          const analyzeRes = await practiceApi.analyzeText(res.data.data.transcript);
          setCorrection(analyzeRes.data.data);
          setPhase('result');
        } catch (err) {
          console.error('Transcription error:', err);
        } finally {
          setIsProcessing(false);
          resetMic();
        }
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  function nextSentence() {
    if (currentIndex < SENTENCES.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
    setPhase('reading');
    setCorrection(null);
    setTranscript('');
  }

  function startSpeaking() {
    setPhase('recording');
    startRecording();
  }

  const currentSentence = SENTENCES[currentIndex];
  const isLast = currentIndex === SENTENCES.length - 1;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Read & Speak</h1>
          <p className="text-gray-400 text-xs">
            Sentence {currentIndex + 1} / {SENTENCES.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-8 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((currentIndex + (phase === 'result' ? 1 : 0)) / SENTENCES.length) * 100}%` }}
        />
      </div>

      {/* Sentence card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Read this sentence</p>
        <p className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
          {currentSentence}
        </p>
      </div>

      {/* Phase: reading */}
      {phase === 'reading' && (
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">Read the sentence above, then tap to record</p>
          <div className="flex justify-center">
            <MicButton
              state="idle"
              onStart={startSpeaking}
              onStop={stopRecording}
            />
          </div>
          <p className="text-xs text-gray-400">Tap the mic to start speaking</p>
        </div>
      )}

      {/* Phase: recording */}
      {phase === 'recording' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <MicButton
              state={isProcessing ? 'processing' : micState}
              onStart={startRecording}
              onStop={stopRecording}
            />
          </div>
          <p className="text-sm text-red-500 animate-pulse font-medium">
            Recording... tap to stop
          </p>
        </div>
      )}

      {/* Phase: processing */}
      {micState === 'processing' && !phase.includes('result') && (
        <div className="text-center space-y-2 mt-4">
          <Spinner className="mx-auto" />
          <p className="text-sm text-gray-500">Analyzing your speech...</p>
        </div>
      )}

      {/* Phase: result */}
      {phase === 'result' && correction && (
        <div className="space-y-4">
          {transcript && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                You said
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">&ldquo;{transcript}&rdquo;</p>
            </div>
          )}

          <CorrectionCard
            correction={correction}
            onRetry={() => {
              setPhase('reading');
              setCorrection(null);
              setTranscript('');
            }}
          />

          <Button
            size="lg"
            className="w-full"
            onClick={nextSentence}
            variant={isLast ? 'outline' : 'primary'}
          >
            {isLast ? '✓ All done!' : 'Next Sentence →'}
          </Button>

          {isLast && (
            <Button
              size="md"
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/progress')}
            >
              View my progress
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
