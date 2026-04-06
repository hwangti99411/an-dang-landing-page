import { Menu, X, ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageToggle } from './LanguageToggle';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';

const baseNavItems = {
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

const extraNavItems = {
  vi: [],
  en: [],
} as const;

type Locale = keyof typeof baseNavItems;

const DESKTOP_VISIBLE_COUNT = 6;

export function Navbar({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const currentLocale = locale as Locale;

  const allNavItems = useMemo(() => {
    return [...baseNavItems[currentLocale], ...extraNavItems[currentLocale]];
  }, [currentLocale]);

  const visibleDesktopItems = allNavItems.slice(0, DESKTOP_VISIBLE_COUNT);
  const moreDesktopItems = allNavItems.slice(DESKTOP_VISIBLE_COUNT);

  const ctaLabel = locale === 'vi' ? settings.hero_primary_cta_vi : settings.hero_primary_cta_en;

  const moreLabel = locale === 'vi' ? 'Xem thêm' : 'More';

  return (
    <header
      id="navbar"
      className="sticky top-0 z-50 border-b border-white/10 bg-[#100406]/85 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* MOBILE */}
        <div className="flex items-center justify-between md:hidden">
          <Link
            to="/"
            className="min-w-0"
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

          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* TABLET */}
        <div className="hidden md:block xl:hidden">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="min-w-0 shrink-0"
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

            <div className="flex shrink-0 items-center gap-3">
              <div className="scale-95">
                <LanguageToggle />
              </div>

              <button
                type="button"
                className="rounded-full bg-[#f4c44f] px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:brightness-105"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          <div className="relative mt-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#100406] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#100406] to-transparent" />

            <nav
              className="
                flex items-center gap-2 overflow-x-auto overflow-y-hidden
                whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03]
                px-2 py-2
                [scrollbar-width:none] [-ms-overflow-style:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {allNavItems.map(([id, label]) => (
                <Link
                  key={id}
                  to={`/${id}`}
                  state={{ scrollTo: id }}
                  className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden xl:flex xl:items-center xl:gap-5">
          <Link
            to="/"
            className="shrink-0"
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

          <div className="min-w-0 flex-1">
            <nav className="flex items-center justify-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-2">
              {visibleDesktopItems.map(([id, label]) => (
                <Link
                  key={id}
                  to={`/${id}`}
                  state={{ scrollTo: id }}
                  className="shrink-0 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  {label}
                </Link>
              ))}

              {moreDesktopItems.length > 0 && (
                <details className="group relative">
                  <summary className="flex list-none cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/8 hover:text-white">
                    <span>{moreLabel}</span>
                    <ChevronDown size={16} className="transition group-open:rotate-180" />
                  </summary>

                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#18080b]/95 p-2 shadow-2xl backdrop-blur-xl">
                    <div className="max-h-[320px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {moreDesktopItems.map(([id, label]) => (
                        <Link
                          key={id}
                          to={`/${id}`}
                          state={{ scrollTo: id }}
                          className="block rounded-xl px-4 py-3 text-sm text-white/75 transition hover:bg-white/8 hover:text-white"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              )}
            </nav>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <LanguageToggle />

            <button
              type="button"
              className="rounded-full bg-[#f4c44f] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:brightness-105"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {open && (
        <div className="border-t border-white/10 bg-[#120507]/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex flex-col">
                {allNavItems.map(([id, label]) => (
                  <Link
                    key={id}
                    to={`/${id}`}
                    state={{ scrollTo: id }}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-white/75 transition hover:bg-white/8 hover:text-white"
                  >
                    {label}
                  </Link>
                ))}

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <div className="w-[102px]">
                    <LanguageToggle />
                  </div>

                  <button
                    type="button"
                    className="rounded-full bg-[#f4c44f] px-4 py-3 text-sm font-semibold text-black transition hover:brightness-105"
                  >
                    {ctaLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
