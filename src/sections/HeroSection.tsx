import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, CalendarDays } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const { locale } = useLanguage();

  const content = {
    badge: locale === 'vi' ? settings.hero_badge_vi : settings.hero_badge_en,
    title: locale === 'vi' ? settings.hero_title_vi : settings.hero_title_en,
    description: locale === 'vi' ? settings.hero_description_vi : settings.hero_description_en,
    primary: locale === 'vi' ? settings.hero_primary_cta_vi : settings.hero_primary_cta_en,
    secondary: locale === 'vi' ? settings.hero_secondary_cta_vi : settings.hero_secondary_cta_en,
    stats: [
      [settings.hero_stat_1_value, locale === 'vi' ? settings.hero_stat_1_label_vi : settings.hero_stat_1_label_en],
      [settings.hero_stat_2_value, locale === 'vi' ? settings.hero_stat_2_label_vi : settings.hero_stat_2_label_en],
      [settings.hero_stat_3_value, locale === 'vi' ? settings.hero_stat_3_label_vi : settings.hero_stat_3_label_en]
    ]
  };

  return (
    <section className="relative overflow-hidden bg-hero-grid" id="hero">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,191,80,0.14),_transparent_26%),radial-gradient(circle_at_80%_15%,_rgba(221,76,12,0.12),_transparent_24%),radial-gradient(circle_at_60%_90%,_rgba(154,4,10,0.18),_transparent_30%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="inline-flex rounded-full border border-brand-gold/20 bg-brand-gold/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-brand-gold">
            {content.badge}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-6xl"
          >
            {content.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg"
          >
            {content.description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#contact" className="btn-primary gap-2">
              {content.primary}
              <ArrowRight size={16} />
            </a>
            <a href="#services" className="btn-secondary gap-2">
              <BadgeCheck size={16} />
              {content.secondary}
            </a>
          </motion.div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {content.stats.map(([value, label], index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.24 + index * 0.08 }}
                className="glass rounded-3xl p-5"
              >
                <div className="text-2xl font-semibold text-brand-gold">{value}</div>
                <div className="mt-2 text-sm leading-6 text-white/68">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
          <div className="glass relative overflow-hidden rounded-[2rem] border border-brand-gold/10 p-6 shadow-glow">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(248,191,80,0.14),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(221,76,12,0.16),_transparent_22%)]" />
            <div className="relative grid gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{locale === 'vi' ? 'Năng lực cốt lõi' : 'Core strengths'}</span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">Live</span>
                </div>
                <div className="mt-5 space-y-3">
                  {['IT Outsourcing', 'Tech Consulting', 'Web / Cloud', 'Admin CMS'].map((item) => (
                    <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80">
                      <span>{item}</span>
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <CalendarDays className="text-brand-gold" />
                  <div className="mt-4 text-xl font-semibold text-white">30 phút</div>
                  <div className="mt-2 text-sm text-white/65">
                    {locale === 'vi' ? 'Buổi tư vấn miễn phí để xác định nhu cầu, phạm vi và định hướng triển khai.' : 'A free consultation session to define your needs, scope, and rollout direction.'}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.25em] text-brand-gold">Cloudflare + Supabase</div>
                  <div className="mt-4 text-xl font-semibold text-white">{locale === 'vi' ? 'Hạ tầng hiện đại, chi phí gọn' : 'Modern stack, lean cost'}</div>
                  <div className="mt-2 text-sm text-white/65">
                    {locale === 'vi' ? 'Tối ưu tốc độ, khả năng mở rộng và quy trình quản trị nội dung cho doanh nghiệp.' : 'Optimized for speed, scalability, and content operations for business teams.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
