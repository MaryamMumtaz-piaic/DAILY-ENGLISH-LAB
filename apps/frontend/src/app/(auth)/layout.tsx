export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F5F0] dark:bg-[#0C1520]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🧪</span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Daily English Lab</h1>
          <p className="text-gray-500 mt-1 text-sm">Your personal AI English coach</p>
        </div>
        {children}
      </div>
    </div>
  );
}
