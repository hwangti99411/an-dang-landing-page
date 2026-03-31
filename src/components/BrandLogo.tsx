import type { SiteSettings } from '@/types';

export function BrandLogo({
  settings,
  compact = false,
}: {
  settings: SiteSettings;
  compact?: boolean;
}) {
  const name = settings.brand_name || 'An Đăng';

  if (settings.logo_url) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={settings.logo_url}
          alt={name}
          className={
            compact ? 'h-10 w-10 rounded-2xl object-cover' : 'h-12 w-12 rounded-2xl object-cover'
          }
        />
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">{name}</div>
          <div className="text-sm font-semibold text-white/90">{settings.company_name_en}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold to-brand-accent text-lg font-black text-brand-dark shadow-glow">
        AD
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-brand-gold">{name}</div>
        <div className="text-sm font-semibold text-white/90">{settings.company_name_en}</div>
      </div>
    </div>
  );
}
