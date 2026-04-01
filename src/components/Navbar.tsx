import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';

const navItems = {
  vi: [
    ['about', 'Giới thiệu'],
    ['services', 'Dịch vụ'],
    ['projects', 'Dự án'],
    ['news', 'Tin tức'],
    ['careers', 'Tuyển dụng'],
    ['contact', 'Liên hệ'],
  ],
  en: [
    ['about', 'About'],
    ['services', 'Services'],
    ['projects', 'Projects'],
    ['news', 'News'],
    ['careers', 'Careers'],
    ['contact', 'Contact'],
  ],
} as const;

export function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const { locale } = useLanguage();
  const navigate = useNavigate();

  return (
    <header
      id="navbar"
      className="sticky top-0 z-50 border-b border-white/10 bg-[#100406]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          state={{ scrollTo: null }}
          onClick={(e) => {
            if (window.location.pathname === '/') {
              e.preventDefault();
              navigate('/');
            }
          }}
        >
          <BrandLogo settings={settings} />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems[locale].map(([id, label]) => (
            <Link key={id} to={`/${id}`} state={{ scrollTo: id }}>
              <button
                key={id}
                type="button"
                className="text-sm text-white/70 transition hover:text-white"
              >
                {label}
              </button>
            </Link>
          ))}
          {/* <Link to="/admin" className="text-sm text-white/70 transition hover:text-white">
            Admin
          </Link> */}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <button type="button" className="btn-primary">
            {locale === 'vi' ? settings.hero_primary_cta_vi : settings.hero_primary_cta_en}
          </button>
        </div>

        <button
          type="button"
          className="rounded-full border border-white/10 p-2 text-white lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#120507] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {navItems[locale].map(([id, label]) => (
              <Link key={id} to={`/${id}`} state={{ scrollTo: id }}>
                <button
                  key={id}
                  type="button"
                  className="text-sm text-white/70 transition hover:text-white"
                >
                  {label}
                </button>
              </Link>
            ))}
            {/* <Link to="/admin" className="text-sm text-white/80" onClick={() => setOpen(false)}>
              Admin
            </Link> */}
            <div className="pt-2 w-[102px]">
              <LanguageToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
