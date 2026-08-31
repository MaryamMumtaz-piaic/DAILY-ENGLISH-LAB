'use client';
import { useEffect, useRef } from 'react';
import type { PracticeMessage, Correction } from '@/types';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { CorrectionCard } from '@/components/practice/CorrectionCard';

interface ChatThreadProps {
  messages: PracticeMessage[];
  isTyping: boolean;
  latestCorrection?: Correction | null;
  onRetry?: () => void;
}

export function ChatThread({
  messages,
  isTyping,
  latestCorrection,
  onRetry,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, latestCorrection]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
      {messages.filter(Boolean).map((msg) => (
        <ChatMessage key={msg.id} message={msg} />
      ))}

      {latestCorrection && !latestCorrection.isCorrect && (
        <div className="self-start w-full max-w-[85%] mt-1">
          <CorrectionCard correction={latestCorrection} onRetry={onRetry} />
        </div>
      )}

      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
