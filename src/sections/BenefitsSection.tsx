import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { useLanguage } from '@/contexts/LanguageContext';

export function BenefitsSection() {
  const { locale } = useLanguage();
  const items = locale === 'vi'
    ? [
        'Rút ngắn thời gian triển khai nhờ đội ngũ sẵn sàng vào dự án nhanh.',
        'Tư duy business-first giúp giải pháp bám sát mục tiêu doanh thu và vận hành.',
        'Kiến trúc hiện đại với React, Hono, Cloudflare và Supabase tối ưu hiệu suất.',
        'Thiết kế sang trọng, chuẩn responsive, dễ nâng cấp thành website doanh nghiệp hoàn chỉnh.'
      ]
    : [
        'Reduce launch timelines with a ready-to-scale engineering team.',
        'Business-first thinking keeps solutions aligned with revenue and operations.',
        'Modern architecture with React, Hono, Cloudflare, and Supabase for strong performance.',
        'Premium design, fully responsive, and easy to grow into a larger corporate platform.'
      ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/5 p-8 lg:grid-cols-[1fr_1fr] lg:p-10">
        <div>
          <SectionHeading
            eyebrow={locale === 'vi' ? 'Điểm nổi bật' : 'Why choose us'}
            title={locale === 'vi' ? 'Hiệu quả nhanh hơn, hình ảnh thương hiệu mạnh hơn.' : 'Faster execution, stronger brand presence.'}
            description={locale === 'vi' ? 'Chúng tôi không chỉ làm đẹp giao diện mà còn xây dựng một trải nghiệm có khả năng chuyển đổi, thuyết phục và nuôi dưỡng lead hiệu quả.' : 'We go beyond aesthetics to build an experience that converts, builds trust, and nurtures leads effectively.'}
          />
        </div>
        <div className="grid gap-4 self-center">
          {items.map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-4"
            >
              <CheckCircle2 className="mt-0.5 text-brand-gold" size={20} />
              <p className="text-sm leading-7 text-white/75">{item}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
