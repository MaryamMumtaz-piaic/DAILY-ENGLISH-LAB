export function TypingIndicator() {
  return (
    <div className="flex gap-3 self-start max-w-[85%]">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <span className="text-xs">🧪</span>
      </div>
      <div className="px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700 flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
