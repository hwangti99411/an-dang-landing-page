import { motion } from 'framer-motion';
import { BrainCircuit, Code2, Globe2, ShieldCheck } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { ServiceItem } from '@/types';

const icons = { Code2, BrainCircuit, Globe2, ShieldCheck };

export function ServicesSection({ services }: { services: ServiceItem[] }) {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="services">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Dịch vụ' : 'Services'}
        title={
          locale === 'vi'
            ? 'Giải pháp toàn diện cho hành trình tăng trưởng số.'
            : 'End-to-end services for your digital growth journey.'
        }
        description={
          locale === 'vi'
            ? 'Từ tư vấn chiến lược đến bàn giao sản phẩm và vận hành, An Đăng giúp doanh nghiệp triển khai nhanh và kiểm soát chất lượng tốt hơn.'
            : 'From strategy to delivery and operations, An Dang helps companies move fast while maintaining quality and control.'
        }
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service, index) => {
          const Icon = icons[service.icon as keyof typeof icons] ?? Code2;
          return (
            <motion.article
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group glass rounded-[1.75rem] p-6 transition hover:-translate-y-1 hover:border-brand-gold/30"
            >
              <div className="inline-flex rounded-2xl bg-brand-gold/10 p-3 text-brand-gold transition group-hover:bg-brand-gold group-hover:text-brand-dark">
                <Icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                {locale === 'vi' ? service.title_vi : service.title_en}
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/68">
                {locale === 'vi' ? service.description_vi : service.description_en}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
