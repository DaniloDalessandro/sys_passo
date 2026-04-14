'use client';

export function OfflineRetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      Tentar novamente
    </button>
  );
}
