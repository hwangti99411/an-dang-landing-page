import { BrandLogo } from './BrandLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';
import { Link } from 'react-router-dom';

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
            <Link to={'/about'} state={{ scrollTo: 'about' }}>
              <span className="gap-2 block cursor-pointer">
                {locale === 'vi' ? 'Giới thiệu' : 'About'}
              </span>
            </Link>
            <Link to={'/services'} state={{ scrollTo: 'services' }}>
              <span className="gap-2 block cursor-pointer">
                {locale === 'vi' ? 'Dịch vụ' : 'Services'}
              </span>
            </Link>
            <Link to={'/news'} state={{ scrollTo: 'news' }}>
              <span className="gap-2 block cursor-pointer">
                {locale === 'vi' ? 'Tin tức' : 'News'}
              </span>
            </Link>
            <Link to={'/careers'} state={{ scrollTo: 'careers' }}>
              <span className="gap-2 block cursor-pointer">
                {locale === 'vi' ? 'Tuyển dụng' : 'Careers'}
              </span>
            </Link>
            <Link to={'/contact'} state={{ scrollTo: 'contact' }}>
              <span className="gap-2 block cursor-pointer">
                {locale === 'vi' ? 'Liên hệ' : 'Contact'}
              </span>
            </Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Contact</h4>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <div>
              {locale === 'vi' ? 'SĐT' : 'Phone'}: {settings.phone}
            </div>
            <div>Email: {settings.email}</div>
            <div>
              {locale === 'vi' ? 'Địa chỉ' : 'Address'}:{' '}
              {locale === 'vi' ? settings.address_vi : settings.address_en}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/45">
        {locale === 'vi' ? settings.footer_copyright_vi : settings.footer_copyright_en}
      </div>
    </footer>
  );
}
