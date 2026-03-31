import { BrandLogo } from './BrandLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';

export function Footer({ settings }: { settings: SiteSettings }) {
  const { locale } = useLanguage();

  return (
    <footer className="border-t border-white/10 bg-black/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <BrandLogo settings={settings} />
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
            {locale === 'vi' ? settings.footer_summary_vi : settings.footer_summary_en}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Menu</h4>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <a href="#about" className="block">{locale === 'vi' ? 'Giới thiệu' : 'About'}</a>
            <a href="#services" className="block">{locale === 'vi' ? 'Dịch vụ' : 'Services'}</a>
            <a href="#news" className="block">{locale === 'vi' ? 'Tin tức' : 'News'}</a>
            <a href="#contact" className="block">{locale === 'vi' ? 'Liên hệ' : 'Contact'}</a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <div>{settings.phone}</div>
            <div>{settings.email}</div>
            <div>{locale === 'vi' ? settings.address_vi : settings.address_en}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/45">
        {locale === 'vi' ? settings.footer_copyright_vi : settings.footer_copyright_en}
      </div>
    </footer>
  );
}
