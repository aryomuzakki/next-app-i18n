import { useTranslations } from 'next-intl';

type Props = {
  locale: string;
};

export default function ServerInfo({ locale }: Props) {
  const t = useTranslations('ExamplesPage');
  const timestamp = new Date().toISOString();

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold">
        {t('serverComponentTitle')}
      </h3>
      <p className="mb-3 text-sm text-muted-foreground">
        {t('serverComponentDescription', { locale })}
      </p>
      <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
        {t('serverTimestamp', { timestamp })}
      </p>
    </div>
  );
}
