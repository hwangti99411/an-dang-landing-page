import { motion } from 'framer-motion';
import { Cpu, Gem, Rocket } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SiteSettings } from '@/types';

export function AboutSection({ settings }: { settings: SiteSettings }) {
  const { locale } = useLanguage();
  const cards = locale === 'vi'
    ? [
        ['Tư duy thực chiến', 'Đề xuất giải pháp bám sát mục tiêu bán hàng, vận hành và hiệu quả đầu tư của doanh nghiệp.', Rocket],
        ['Hình ảnh cao cấp', 'Thiết kế hiện đại, ngôn ngữ thương hiệu rõ ràng và trải nghiệm chuyên nghiệp trên mọi thiết bị.', Gem],
        ['Năng lực triển khai', 'Phát triển landing page, website doanh nghiệp, dashboard, API và hệ thống quản trị nội bộ.', Cpu]
      ]
    : [
        ['Practical execution', 'Solutions are shaped around sales, operations, and business return on investment.', Rocket],
        ['Premium presentation', 'Modern design, clear brand language, and polished experiences across all devices.', Gem],
        ['Delivery capability', 'Build landing pages, corporate sites, dashboards, APIs, and internal management systems.', Cpu]
      ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="about">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SectionHeading
          eyebrow={locale === 'vi' ? settings.about_eyebrow_vi : settings.about_eyebrow_en}
          title={locale === 'vi' ? settings.about_title_vi : settings.about_title_en}
          description={locale === 'vi' ? settings.about_description_vi : settings.about_description_en}
        />

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map(([title, desc, Icon] : any[], index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="glass rounded-[1.75rem] p-6"
            >
              <div className="inline-flex rounded-2xl bg-brand-gold/10 p-3 text-brand-gold">
                <Icon size={20} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/68">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
