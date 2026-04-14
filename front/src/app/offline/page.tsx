// Renderizada estaticamente para estar disponível no cache do service worker
export const dynamic = 'force-static';

import type { Metadata } from 'next';
import { OfflineRetryButton } from './retry-button';

export const metadata: Metadata = {
  title: 'Sem conexão — ViaLumiar',
  description: 'Você está offline. Verifique sua conexão e tente novamente.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Ícone offline */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-blue-800 dark:text-blue-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            Você está offline
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Não foi possível carregar esta página. Verifique sua conexão com a
            internet e tente novamente.
          </p>
        </div>

        <OfflineRetryButton />

        <p className="text-xs text-muted-foreground/60">
          ViaLumiar — Sistema de Gestão
        </p>
      </div>
    </div>
  );
}
