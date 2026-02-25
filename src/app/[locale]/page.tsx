import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';
import { Link } from '@/i18n/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: Props) {
  const { locale } = use(params);

  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations('HomePage');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="max-w-md text-center text-lg text-gray-600 dark:text-gray-400">
        {t('description')}
      </p>
      <Link
        href="/"
        locale={locale === 'en' ? 'id' : 'en'}
        className="rounded-lg bg-foreground px-6 py-3 text-background transition-opacity hover:opacity-90"
      >
        {t('switchLocale')}
      </Link>
    </div>
  );
}
