'use client';
import { cn } from '@/lib/utils';

type Props = {
  state: 'idle' | 'recording' | 'processing';
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
};

export function MicButton({ state, onStart, onStop, disabled }: Props) {
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';

  return (
    <button
      onClick={isRecording ? onStop : onStart}
      disabled={disabled || isProcessing}
      className={cn(
        'relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2',
        isRecording
          ? 'bg-red-500 focus:ring-red-300 scale-110'
          : isProcessing
          ? 'bg-gray-300 cursor-not-allowed'
          : 'bg-primary hover:bg-primary/90 focus:ring-primary/40'
      )}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {/* Pulse ring when recording */}
      {isRecording && (
        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
      )}
      {isProcessing ? (
        <svg
          className="w-8 h-8 text-white animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="60"
            strokeDashoffset="20"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      )}
    </button>
  );
}
