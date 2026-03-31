import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="glass flex items-center gap-1 rounded-full p-1">
      {(['vi', 'en'] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={cn(
            'rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition',
            locale === item ? 'bg-brand-gold text-brand-dark' : 'text-white/65 hover:text-white',
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
