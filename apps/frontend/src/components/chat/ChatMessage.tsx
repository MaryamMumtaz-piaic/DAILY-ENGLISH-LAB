import { cn } from '@/lib/utils';
import type { PracticeMessage } from '@/types';

export function ChatMessage({ message }: { message: PracticeMessage }) {
  const isAI = message.role === 'ASSISTANT';
  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAI ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs">🧪</span>
        </div>
      )}
      <div
        className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isAI
            ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700'
            : 'bg-primary text-white rounded-tr-sm'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
