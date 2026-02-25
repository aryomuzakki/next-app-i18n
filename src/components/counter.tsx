'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function Counter() {
  const t = useTranslations('ExamplesPage');
  const [count, setCount] = useState(0);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">{t('clientComponentTitle')}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        {t('clientComponentDescription')}
      </p>
      <div className="flex items-center gap-4">
        <span className="min-w-[120px] text-xl font-bold">
          {t('counterLabel', { count })}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCount((c) => c - 1)}
            className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            {t('decrement')}
          </button>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            {t('increment')}
          </button>
          <button
            onClick={() => setCount(0)}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            {t('reset')}
          </button>
        </div>
      </div>
    </div>
  );
}
