import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TestimonialItem } from '@/types';

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialItem[] }) {
  const { locale } = useLanguage();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow={locale === 'vi' ? 'Phản hồi' : 'Testimonials'}
        title={locale === 'vi' ? 'Khách hàng tìm thấy sự an tâm trong từng giai đoạn triển khai.' : 'Clients find confidence in every stage of delivery.'}
        description={locale === 'vi' ? 'Một vài nội dung mẫu để bạn thay bằng feedback thật từ khách hàng, đối tác hoặc ứng viên.' : 'Sample references you can replace with real feedback from clients, partners, or candidates.'}
        align="center"
      />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {testimonials.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            className="glass rounded-[1.75rem] p-6"
          >
            <Quote className="text-brand-gold" />
            <p className="mt-5 text-sm leading-7 text-white/75">“{locale === 'vi' ? item.quote_vi : item.quote_en}”</p>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="font-semibold text-white">{item.name}</div>
              <div className="mt-1 text-sm text-white/55">
                {locale === 'vi' ? item.role_vi : item.role_en} · {item.company}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
